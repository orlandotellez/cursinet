using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NpgsqlTypes;

#nullable disable

namespace Cursinet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:user_role", "student,instructor,admin,moderator");

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    icon_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    parent_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.id);
                    table.ForeignKey(
                        name: "FK_Categories_Categories_parent_id",
                        column: x => x.parent_id,
                        principalTable: "Categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    email_verified = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    phone = table.Column<string>(type: "text", nullable: true),
                    image = table.Column<string>(type: "text", nullable: true),
                    role = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    bio = table.Column<string>(type: "text", nullable: true),
                    website_url = table.Column<string>(type: "text", nullable: true),
                    github_url = table.Column<string>(type: "text", nullable: true),
                    linkedin_url = table.Column<string>(type: "text", nullable: true),
                    stripe_customer_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    last_seen_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Verification",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    identifier = table.Column<string>(type: "text", nullable: false),
                    value = table.Column<string>(type: "text", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Verification", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Account",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    account_id = table.Column<string>(type: "text", nullable: false),
                    provider_id = table.Column<string>(type: "text", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    access_token = table.Column<string>(type: "text", nullable: true),
                    refresh_token = table.Column<string>(type: "text", nullable: true),
                    id_token = table.Column<string>(type: "text", nullable: true),
                    access_token_expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    refresh_token_expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    scope = table.Column<string>(type: "text", nullable: true),
                    password = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Account", x => x.id);
                    table.ForeignKey(
                        name: "FK_Account_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Courses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    instructor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    slug = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    short_description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    thumbnail_url = table.Column<string>(type: "text", nullable: true),
                    preview_video_url = table.Column<string>(type: "text", nullable: true),
                    level = table.Column<int>(type: "integer", nullable: false),
                    language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "es"),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    students_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    average_rating = table.Column<decimal>(type: "numeric(3,2)", nullable: false, defaultValue: 0m),
                    reviews_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    price = table.Column<decimal>(type: "numeric(10,2)", nullable: false, defaultValue: 0m),
                    original_price = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    is_free = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_published = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_featured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    requirements = table.Column<string[]>(type: "text[]", nullable: true),
                    learning_objectives = table.Column<string[]>(type: "text[]", nullable: true),
                    search_vector = table.Column<NpgsqlTsVector>(type: "tsvector", nullable: true),
                    published_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.id);
                    table.ForeignKey(
                        name: "FK_Courses_Categories_category_id",
                        column: x => x.category_id,
                        principalTable: "Categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Courses_Users_instructor_id",
                        column: x => x.instructor_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmailVerificationLogs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    verified_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ip_address = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailVerificationLogs", x => x.id);
                    table.ForeignKey(
                        name: "FK_EmailVerificationLogs_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LoginLogs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    email = table.Column<string>(type: "text", nullable: true),
                    success = table.Column<bool>(type: "boolean", nullable: false),
                    provider_id = table.Column<string>(type: "text", nullable: true),
                    ip_address = table.Column<string>(type: "text", nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    failure_reason = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoginLogs", x => x.id);
                    table.ForeignKey(
                        name: "FK_LoginLogs_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PasswordResetLogs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ip_address = table.Column<string>(type: "text", nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PasswordResetLogs", x => x.id);
                    table.ForeignKey(
                        name: "FK_PasswordResetLogs_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Sessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    token = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    ip_address = table.Column<string>(type: "text", nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sessions_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_two_factor",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    secret = table.Column<string>(type: "text", nullable: false),
                    backup_codes = table.Column<string[]>(type: "text[]", nullable: true),
                    is_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_two_factor", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_two_factor_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CourseTags",
                columns: table => new
                {
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tag_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseTags", x => new { x.course_id, x.tag_id });
                    table.ForeignKey(
                        name: "FK_CourseTags_Courses_course_id",
                        column: x => x.course_id,
                        principalTable: "Courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CourseTags_Tags_tag_id",
                        column: x => x.tag_id,
                        principalTable: "Tags",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Modules",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    is_published = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Modules", x => x.id);
                    table.ForeignKey(
                        name: "FK_Modules_Courses_course_id",
                        column: x => x.course_id,
                        principalTable: "Courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: true),
                    stripe_payment_intent_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "USD"),
                    status = table.Column<int>(type: "integer", nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    paid_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    refunded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.id);
                    table.ForeignKey(
                        name: "FK_Payments_Courses_course_id",
                        column: x => x.course_id,
                        principalTable: "Courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payments_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Lessons",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    module_id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    slug = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    type = table.Column<int>(type: "integer", nullable: false),
                    video_url = table.Column<string>(type: "text", nullable: true),
                    video_duration_seconds = table.Column<int>(type: "integer", nullable: true),
                    content_markdown = table.Column<string>(type: "text", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    is_published = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_preview = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    attachment_urls = table.Column<string[]>(type: "text[]", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lessons", x => x.id);
                    table.ForeignKey(
                        name: "FK_Lessons_Courses_course_id",
                        column: x => x.course_id,
                        principalTable: "Courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Lessons_Modules_module_id",
                        column: x => x.module_id,
                        principalTable: "Modules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Account_account_id",
                table: "Account",
                column: "account_id");

            migrationBuilder.CreateIndex(
                name: "IX_Account_provider_id",
                table: "Account",
                column: "provider_id");

            migrationBuilder.CreateIndex(
                name: "IX_Account_provider_id_account_id",
                table: "Account",
                columns: new[] { "provider_id", "account_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Account_user_id",
                table: "Account",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_is_active",
                table: "Categories",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_parent_id",
                table: "Categories",
                column: "parent_id");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_slug",
                table: "Categories",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_courses_search",
                table: "Courses",
                column: "search_vector");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_category_id",
                table: "Courses",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_instructor_id",
                table: "Courses",
                column: "instructor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_is_featured",
                table: "Courses",
                column: "is_featured");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_is_published",
                table: "Courses",
                column: "is_published");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_slug",
                table: "Courses",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourseTags_course_id",
                table: "CourseTags",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "IX_CourseTags_tag_id",
                table: "CourseTags",
                column: "tag_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmailVerificationLogs_user_id",
                table: "EmailVerificationLogs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmailVerificationLogs_verified_at",
                table: "EmailVerificationLogs",
                column: "verified_at");

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_course_id",
                table: "Lessons",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_module_id",
                table: "Lessons",
                column: "module_id");

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_slug",
                table: "Lessons",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_type",
                table: "Lessons",
                column: "type");

            migrationBuilder.CreateIndex(
                name: "IX_LoginLogs_created_at",
                table: "LoginLogs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_LoginLogs_email",
                table: "LoginLogs",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "IX_LoginLogs_success",
                table: "LoginLogs",
                column: "success");

            migrationBuilder.CreateIndex(
                name: "IX_LoginLogs_user_id",
                table: "LoginLogs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Modules_course_id",
                table: "Modules",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetLogs_created_at",
                table: "PasswordResetLogs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetLogs_user_id",
                table: "PasswordResetLogs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_course_id",
                table: "Payments",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_status",
                table: "Payments",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_stripe_payment_intent_id",
                table: "Payments",
                column: "stripe_payment_intent_id");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_user_id",
                table: "Payments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_expires_at",
                table: "Sessions",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_token",
                table: "Sessions",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_user_id",
                table: "Sessions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_slug",
                table: "Tags",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_two_factor_user_id",
                table: "user_two_factor",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "idx_users_created_at",
                table: "Users",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Users_email",
                table: "Users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_role",
                table: "Users",
                column: "role");

            migrationBuilder.CreateIndex(
                name: "IX_Users_stripe_customer_id",
                table: "Users",
                column: "stripe_customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_username",
                table: "Users",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Verification_expires_at",
                table: "Verification",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "IX_Verification_identifier",
                table: "Verification",
                column: "identifier");

            migrationBuilder.CreateIndex(
                name: "IX_Verification_value",
                table: "Verification",
                column: "value");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Account");

            migrationBuilder.DropTable(
                name: "CourseTags");

            migrationBuilder.DropTable(
                name: "EmailVerificationLogs");

            migrationBuilder.DropTable(
                name: "Lessons");

            migrationBuilder.DropTable(
                name: "LoginLogs");

            migrationBuilder.DropTable(
                name: "PasswordResetLogs");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Sessions");

            migrationBuilder.DropTable(
                name: "user_two_factor");

            migrationBuilder.DropTable(
                name: "Verification");

            migrationBuilder.DropTable(
                name: "Tags");

            migrationBuilder.DropTable(
                name: "Modules");

            migrationBuilder.DropTable(
                name: "Courses");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
