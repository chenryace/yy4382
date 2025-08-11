import {
  describe,
  expect,
  it,
  beforeAll,
  beforeEach,
  vi,
  afterEach,
  afterAll,
} from "vitest";
import * as nodemailer from "nodemailer";
import { EmailNotificationProvider, EmailNotificationConfig } from "./email";
import {
  NotificationPayload,
  NotificationNewReply,
  NotificationNewComment,
} from "../types";

// 创建一个测试子类来使用测试传输器
class TestableEmailNotificationProvider extends EmailNotificationProvider {
  public testTransporter: nodemailer.Transporter | null = null;
  public sentEmails: Array<{
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
  }> = [];

  constructor(config: EmailNotificationConfig) {
    super(config);

    // avoid forgetting to initialize the transporter and sending real emails
    this.transporter = undefined as any;
  }

  // 覆盖父类方法以使用测试传输器
  async initializeTestTransporter(): Promise<void> {
    // 创建测试账户
    const testAccount = await nodemailer.createTestAccount();

    this.testTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Mock sendMail 方法来捕获发送的邮件
    vi.spyOn(this.testTransporter, "sendMail").mockImplementation(
      async (mailOptions: nodemailer.SendMailOptions) => {
        this.sentEmails.push({
          from: String(mailOptions.from || ""),
          to: String(mailOptions.to || ""),
          subject: String(mailOptions.subject || ""),
          text: String(mailOptions.text || ""),
          html: String(mailOptions.html || ""),
        });

        return {
          messageId: "test-message-id-" + Date.now(),
          envelope: {
            from: mailOptions.from,
            to: Array.isArray(mailOptions.to)
              ? mailOptions.to
              : [mailOptions.to],
          },
          accepted: Array.isArray(mailOptions.to)
            ? mailOptions.to
            : [mailOptions.to],
          rejected: [],
          pending: [],
          response: "250 OK: message queued",
        };
      },
    );

    // 替换实际的传输器
    (this as any).transporter = this.testTransporter;
  }

  clearSentEmails(): void {
    this.sentEmails = [];
  }

  getLastSentEmail() {
    return this.sentEmails[this.sentEmails.length - 1];
  }
}

describe(
  "EmailNotificationProvider",
  () => {
    let provider: TestableEmailNotificationProvider;
    let config: EmailNotificationConfig;

    const baseCommentReplyData: NotificationNewReply = {
      commentId: 1,
      rawContent: "This is a test comment",
      renderedContent: "<p>This is a test comment</p>",
      parentCommentId: 2,
      parentCommentRawContent: "Original comment",
      parentCommentRenderedContent: "<p>Original comment</p>",
      parentCommentAuthorName: "Original Author",
      parentCommentAuthorEmail: "original@example.com",
      path: "/post/test-post",
      authorName: "John Doe",
      authorEmail: "john@example.com",
    };

    const baseAdminCommentData: NotificationNewComment = {
      commentId: 1,
      path: "/post/test-post",
      rawContent: "This is a test comment",
      renderedContent: "<p>This is a test comment</p>",
      authorName: "John Doe",
      authorId: 123,
      isSpam: false,
    };

    beforeAll(async () => {
      config = {
        from: "test@example.com",
        smtp: {
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: "test@ethereal.email",
            pass: "test-password",
          },
        },
      };

      provider = new TestableEmailNotificationProvider(config);
      await provider.initializeTestTransporter();
    });

    afterEach(() => {
      provider.clearSentEmails();
    });

    describe("constructor", () => {
      it("should initialize with correct configuration", () => {
        expect(provider.name).toBe("react-email");
        expect(provider.isEnabled()).toBe(true);
      });
    });

    describe("isEnabled", () => {
      it("should return true when SMTP credentials are provided", () => {
        expect(provider.isEnabled()).toBe(true);
      });

      it("should return false when SMTP user is missing", () => {
        const invalidConfig = {
          ...config,
          smtp: {
            ...config.smtp,
            auth: {
              user: "",
              pass: "password",
            },
          },
        };
        const invalidProvider = new EmailNotificationProvider(invalidConfig);
        expect(invalidProvider.isEnabled()).toBe(false);
      });

      it("should return false when SMTP password is missing", () => {
        const invalidConfig = {
          ...config,
          smtp: {
            ...config.smtp,
            auth: {
              user: "user@example.com",
              pass: "",
            },
          },
        };
        const invalidProvider = new EmailNotificationProvider(invalidConfig);
        expect(invalidProvider.isEnabled()).toBe(false);
      });
    });

    describe("send", () => {
      it("should send comment reply notification", async () => {
        const notification: NotificationPayload = {
          type: "comment_reply",
          recipient: "recipient@example.com",
          data: baseCommentReplyData,
        };

        await provider.send(notification);

        const sentEmail = provider.getLastSentEmail();
        expect(sentEmail).toBeDefined();
        expect(sentEmail.from).toBe(config.from);
        expect(sentEmail.to).toBe(notification.recipient);
        expect(sentEmail.subject).toContain("New reply to your comment");
        expect(sentEmail.subject).toContain(baseCommentReplyData.path);
        expect(sentEmail.html).toContain(baseCommentReplyData.authorName);
        expect(sentEmail.html).toContain(baseCommentReplyData.rawContent);
        expect(sentEmail.text).toBeTruthy();
      });

      it("should send admin new comment notification", async () => {
        const notification: NotificationPayload = {
          type: "admin_new_comment",
          recipient: "admin@example.com",
          data: baseAdminCommentData,
        };

        await provider.send(notification);

        const sentEmail = provider.getLastSentEmail();
        expect(sentEmail).toBeDefined();
        expect(sentEmail.subject).toContain("New comment requires moderation");
        expect(sentEmail.subject).toContain(baseAdminCommentData.path);
        expect(sentEmail.html).toContain(baseAdminCommentData.authorName);
        expect(sentEmail.html).toContain(baseAdminCommentData.rawContent);
      });

      it("should handle anonymous author names", async () => {
        const notification: NotificationPayload = {
          type: "comment_reply",
          recipient: "recipient@example.com",
          data: {
            ...baseCommentReplyData,
            authorName: "",
          },
        };

        await provider.send(notification);

        const sentEmail = provider.getLastSentEmail();
        expect(sentEmail.html).toContain("Anonymous");
      });

      it("should handle empty comment content", async () => {
        const notification: NotificationPayload = {
          type: "comment_reply",
          recipient: "recipient@example.com",
          data: {
            ...baseCommentReplyData,
            rawContent: "",
            renderedContent: "",
          },
        };

        await provider.send(notification);

        const sentEmail = provider.getLastSentEmail();
        expect(sentEmail).toBeDefined();
        expect(sentEmail.html).toBeTruthy();
      });

      it("should throw error for unknown notification type", async () => {
        const notification = {
          type: "unknown_type" as any,
          recipient: "recipient@example.com",
          data: baseCommentReplyData,
        };

        await expect(provider.send(notification)).rejects.toThrow(
          "Unknown notification type: unknown_type",
        );
      });

      it("should throw error when provider is not enabled", async () => {
        const disabledConfig = {
          ...config,
          smtp: {
            ...config.smtp,
            auth: {
              user: "",
              pass: "",
            },
          },
        };
        const disabledProvider = new EmailNotificationProvider(disabledConfig);

        const notification: NotificationPayload = {
          type: "comment_reply",
          recipient: "recipient@example.com",
          data: baseCommentReplyData,
        };

        await expect(disabledProvider.send(notification)).rejects.toThrow(
          "React Email notification provider is not configured",
        );
      });
    });

    describe("email content generation", () => {
      it("should generate both HTML and text versions", async () => {
        const notification: NotificationPayload = {
          type: "comment_reply",
          recipient: "recipient@example.com",
          data: {
            ...baseCommentReplyData,
            path: "/post/test-post",
            rawContent: "Test comment",
            authorName: "Test Author",
          },
        };

        await provider.send(notification);

        const sentEmail = provider.getLastSentEmail();
        expect(sentEmail.html).toBeTruthy();
        expect(sentEmail.text).toBeTruthy();
        expect(sentEmail.html).not.toBe(sentEmail.text);
      });

      it("should include post slug in generated content", async () => {
        const notification: NotificationPayload = {
          type: "comment_reply",
          recipient: "recipient@example.com",
          data: {
            ...baseCommentReplyData,
            path: "/post/my-awesome-post",
            rawContent: "Great post!",
            authorName: "Fan",
          },
        };

        await provider.send(notification);

        const sentEmail = provider.getLastSentEmail();
        // 检查邮件内容是否包含适当的链接或引用
        expect(sentEmail.html).toContain("/post/my-awesome-post");
      });
    });

    describe("multiple emails", () => {
      it("should handle sending multiple emails", async () => {
        const notifications: NotificationPayload[] = [
          {
            type: "comment_reply",
            recipient: "user1@example.com",
            data: {
              ...baseCommentReplyData,
              path: "/post/post-1",
              rawContent: "Comment 1",
              authorName: "Author 1",
            },
          },
          {
            type: "comment_reply",
            recipient: "user2@example.com",
            data: {
              ...baseCommentReplyData,
              path: "/post/post-2",
              rawContent: "Comment 2",
              authorName: "Author 2",
            },
          },
        ];

        for (const notification of notifications) {
          await provider.send(notification);
        }

        expect(provider.sentEmails).toHaveLength(2);
        expect(provider.sentEmails[0].to).toBe("user1@example.com");
        expect(provider.sentEmails[1].to).toBe("user2@example.com");
      });
    });

    // 真实邮件发送测试 - 只有设置环境变量时才运行
    describe.runIf(process.env.SEND_REAL_EMAILS === "true")(
      "Real Email Sending to Ethereal",
      () => {
        let realProvider: EmailNotificationProvider;
        let testAccount: nodemailer.TestAccount;
        let sentMessageUrls: string[] = [];
        let capturedInfos: any[] = [];

        beforeAll(async () => {
          // 创建真实的 Ethereal 测试账户
          testAccount = await nodemailer.createTestAccount();

          const realConfig: EmailNotificationConfig = {
            from: `Test App <${testAccount.user}>`,
            smtp: {
              host: "smtp.ethereal.email",
              port: 587,
              secure: false,
              auth: {
                user: testAccount.user,
                pass: testAccount.pass,
              },
            },
          };

          realProvider = new EmailNotificationProvider(realConfig);

          // Spy on sendMail to capture info objects for URL generation
          vi.spyOn(
            (realProvider as any).transporter,
            "sendMail",
          ).mockImplementation(async function (this: any, mailOptions: any) {
            // Call the original sendMail method
            const originalSendMail = nodemailer.createTransport({
              host: "smtp.ethereal.email",
              port: 587,
              secure: false,
              auth: {
                user: testAccount.user,
                pass: testAccount.pass,
              },
            }).sendMail;

            const info = await originalSendMail.call(this, mailOptions);
            capturedInfos.push(info);

            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) {
              sentMessageUrls.push(previewUrl);
              console.log(`✉️  Email Preview: ${previewUrl}`);
            }

            return info;
          });

          console.log(`\n🔗 Ethereal Account Created:`);
          console.log(`   User: ${testAccount.user}`);
          console.log(`   Pass: ${testAccount.pass}`);
          console.log(`   Web UI: https://ethereal.email/login`);
        });

        beforeEach(() => {
          // Clear captured infos before each test
          capturedInfos = [];
        });

        afterAll(() => {
          if (sentMessageUrls.length > 0) {
            console.log(`\n📧 Preview URLs for manual inspection:`);
            sentMessageUrls.forEach((url, index) => {
              console.log(`   ${index + 1}. ${url}`);
            });
          }
        });

        it("should send real comment reply notification using React Email template", async () => {
          const notification: NotificationPayload = {
            type: "comment_reply",
            recipient: testAccount.user,
            data: {
              ...baseCommentReplyData,
              path: "/post/test-comment-reply",
              rawContent:
                "This is a test reply comment that demonstrates the comment reply notification email template. It includes rich content with **markdown** support and shows how the actual React Email template renders.",
              renderedContent:
                "<p>This is a test reply comment that demonstrates the comment reply notification email template. It includes rich content with <strong>markdown</strong> support and shows how the actual React Email template renders.</p>",
              authorName: "Jane Developer",
              authorEmail: "jane@example.com",
            },
          };

          console.log(`\n📧 Sending Comment Reply Notification...`);

          // 使用真实的 provider.send 方法（会使用 React Email 模板）
          await realProvider.send(notification);

          expect(capturedInfos.length).toBe(1);
          expect(capturedInfos[0].messageId).toBeTruthy();
        });

        it("should send real admin new comment notification using React Email template", async () => {
          const notification: NotificationPayload = {
            type: "admin_new_comment",
            recipient: testAccount.user,
            data: {
              ...baseAdminCommentData,
              path: "/post/security-best-practices",
              rawContent:
                "This comment contains potentially suspicious content that needs admin review. It might include promotional links or inappropriate language that requires moderation before being published publicly. Please review carefully.",
              renderedContent:
                "<p>This comment contains potentially suspicious content that needs admin review. It might include promotional links or inappropriate language that requires moderation before being published publicly. Please review carefully.</p>",
              authorName: "Anonymous Commenter",
              isSpam: true,
            },
          };

          console.log(`\n📧 Sending Admin New Comment Notification...`);

          // 使用真实的 provider.send 方法（会使用 React Email 模板）
          await realProvider.send(notification);

          expect(capturedInfos.length).toBe(1);
          expect(capturedInfos[0].messageId).toBeTruthy();
        });

        it("should send complex comment reply with rich content", async () => {
          const notification: NotificationPayload = {
            type: "comment_reply",
            recipient: testAccount.user,
            data: {
              ...baseCommentReplyData,
              path: "/post/react-performance-optimization",
              rawContent: `Thanks for this comprehensive guide! I have a follow-up question about the useMemo hook:

**Question:** When dealing with expensive calculations, should we always wrap them in useMemo, or are there cases where it might actually hurt performance?

\`\`\`javascript
const expensiveValue = useMemo(() => {
  return heavyCalculation(props.data);
}, [props.data]);
\`\`\`

I've heard that the memoization itself has overhead. What's your recommendation for deciding when to use it?

Also, how does this interact with React.memo() for component memoization? Should we use both together?

Looking forward to your insights!`,
              renderedContent: `<p>Thanks for this comprehensive guide! I have a follow-up question about the useMemo hook:</p>
<p><strong>Question:</strong> When dealing with expensive calculations, should we always wrap them in useMemo, or are there cases where it might actually hurt performance?</p>
<pre><code class="language-javascript">const expensiveValue = useMemo(() => {
  return heavyCalculation(props.data);
}, [props.data]);
</code></pre>
<p>I've heard that the memoization itself has overhead. What's your recommendation for deciding when to use it?</p>
<p>Also, how does this interact with React.memo() for component memoization? Should we use both together?</p>
<p>Looking forward to your insights!</p>`,
              authorName: "David Kim",
              authorEmail: "david.kim@webdev.com",
            },
          };

          console.log(
            `\n📧 Sending Complex Comment Reply with Rich Content...`,
          );

          // 使用真实的 provider.send 方法，测试复杂内容的渲染
          await realProvider.send(notification);

          console.log(
            `✉️  Complex Content Test: Check the Ethereal inbox to see how rich content renders`,
          );
          console.log(`   Login at: https://ethereal.email/login`);
          console.log(
            `   Credentials: ${testAccount.user} / ${testAccount.pass}`,
          );

          expect(capturedInfos.length).toBe(1);
          expect(capturedInfos[0].messageId).toBeTruthy();
        });
      },
    );
  },
  { timeout: 10000 },
);
