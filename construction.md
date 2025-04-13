<!-- geminiのoutput mdファイル -->

# construction.md

## Todo アプリケーション構築手順

このドキュメントでは、Next.js, Tailwind CSS, Prisma, PostgreSQL, Docker を用いて Todo アプリケーションを構築する手順を説明します。以下の技術スタックと実装ルールに基づきます。

**技術スタック:**

- フレームワーク: Next.js (App Router)
- スタイリング: Tailwind CSS
- ORM: Prisma
- データベース: PostgreSQL
- コンテナ化: Docker

**実装ルール:**

- DB アクセス層: Server Actions と `formData` を使用
- バリデーション: Zod
- エラーハンドリング: Server Actions 内およびコンポーネントでの実装
- コンポーネント: Server Components と `useActionState` フック
- 型安全: Prisma Client の型を利用

---

### 1. プロジェクトセットアップ

#### 1.1. Next.js プロジェクト作成

```bash
npx create-next-app@latest todo-app --typescript --tailwind --eslint --app
cd todo-app
```
