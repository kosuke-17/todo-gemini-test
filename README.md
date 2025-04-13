初回のプロダクトの作成は gemini の pro(experimental)に頼んだ

以下のプロンプトを投げた。cursor の claude-3.7-sonnet よりも Server Functions と Server Actions の書き方が最新の v15 に近かった

```
todoアプリの作成をしたいです。

Next.jsとtailwindcss、Prisma、Posgresql、Dockerを用いたwebアプリの作成手順を書き出してください。



以下の実装ルールを守ってください。

Server FunctionsとformDataを用いてDBアクセス層を実装。

Zodを用いたバリデーション。

エラーハンドリングの実装。

Server ComponentsとuseActionStateを用いた、コンポーネントの実装。

Prisma Clientを用いた、型の利用。



construction.mdに記載してください。
```
