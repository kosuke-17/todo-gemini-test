# useState フック内部処理シーケンス図

以下のシーケンス図は、React の`useState`フックが内部的にどのように処理を行っているかを示しています。

## 初回レンダリング時（マウント時）のシーケンス

```mermaid
sequenceDiagram
    participant C as コンポーネント
    participant R as React
    participant F as Fiber
    participant S as Scheduler
    participant D as DOM

    C->>R: useState(initialState)を呼び出し
    R->>R: mountState関数を実行
    R->>F: mountWorkInProgressHook()で新しいフックオブジェクト作成

    alt initialStateが関数の場合
        R->>R: 初期化関数を実行
        R->>F: 戻り値をhook.memoizedStateとhook.baseStateに保存
    else
        R->>F: initialStateをhook.memoizedStateとhook.baseStateに保存
    end

    R->>F: 更新キュー(hook.queue)を作成
    R->>R: dispatchSetState関数を作成
    R->>C: [現在の状態, セッター関数]を返却

    C->>R: レンダリング結果を返却
    R->>F: Fiberツリーを構築
    R->>S: コミットフェーズをスケジュール
    S->>D: DOMに変更を適用
```

## 状態更新のシーケンス

```mermaid
sequenceDiagram
    participant C as コンポーネント
    participant S as セッター関数
    participant R as React
    participant F as Fiber
    participant Sch as Scheduler
    participant D as DOM

    C->>S: setXxx(newValue)を呼び出し
    S->>R: dispatchSetState実行

    R->>R: requestUpdateLaneで更新の優先度(lane)を決定

    alt 新しい値が関数の場合（更新関数）
        R->>R: action = (prev) => 更新関数
    else
        R->>R: action = 新しい値
    end

    R->>R: updateオブジェクトを作成(action, lane, ...etc)

    alt レンダリングフェーズ中の呼び出し
        R->>R: enqueueRenderPhaseUpdateで処理
    else
        R->>F: hook.queueに更新を追加
        R->>F: Fiberを「ダーティ」としてマーク
    end

    R->>Sch: scheduleUpdateOnFiberで再レンダリングをスケジュール

    Sch->>C: コンポーネントを再レンダリング

    C->>R: useState(initialState)を再度呼び出し
    R->>R: updateState関数を実行
    R->>F: updateWorkInProgressHook()で既存のフックを取得
    R->>R: フックのキュー内の保留中の更新を処理
    R->>R: 新しい状態を計算
    R->>F: hook.memoizedStateを更新
    R->>C: [新しい状態, セッター関数]を返却

    C->>R: 新しいレンダリング結果を返却
    R->>F: Fiberツリーを更新
    R->>Sch: コミットフェーズをスケジュール
    Sch->>D: DOMに変更を適用
```

## 複数の状態更新（バッチ処理）のシーケンス

```mermaid
sequenceDiagram
    participant C as コンポーネント
    participant EH as イベントハンドラー
    participant S1 as セッター関数1
    participant S2 as セッター関数2
    participant R as React
    participant F as Fiber
    participant Sch as Scheduler
    participant D as DOM

    C->>EH: イベント発生
    EH->>S1: setXxx(valueA)を呼び出し
    S1->>R: dispatchSetState実行
    R->>F: 更新をキューに追加

    EH->>S2: setYyy(valueB)を呼び出し
    S2->>R: dispatchSetState実行
    R->>F: 更新をキューに追加

    EH->>R: イベントハンドラー完了
    R->>Sch: 単一の更新としてスケジュール

    Sch->>C: コンポーネントを再レンダリング
    C->>R: useState呼び出し（値1）
    R->>F: キュー内の更新を処理して新しい状態を計算
    R->>C: [新しい状態1, セッター関数1]を返却

    C->>R: useState呼び出し（値2）
    R->>F: キュー内の更新を処理して新しい状態を計算
    R->>C: [新しい状態2, セッター関数2]を返却

    C->>R: 新しいレンダリング結果を返却
    R->>F: Fiberツリーを更新
    R->>Sch: コミットフェーズをスケジュール
    Sch->>D: DOMに変更を適用（一度だけ）
```

## 更新関数を使用した状態更新の詳細シーケンス

```mermaid
sequenceDiagram
    participant C as コンポーネント
    participant S as セッター関数
    participant R as React
    participant F as Fiber

    C->>S: setCount(prevCount => prevCount + 1)を呼び出し
    S->>R: dispatchSetState実行
    R->>R: action = 更新関数として保存
    R->>F: hook.queueに更新を追加

    Note over R,F: 再レンダリング時

    R->>F: 保留中の更新を取得
    R->>R: 更新関数を適用する準備
    R->>F: hook.memoizedStateを取得（現在の状態）
    R->>R: 更新関数を実行(prevState => prevState + 1)
    R->>R: Object.is()で前回の状態と比較

    alt 状態が変化した場合
        R->>F: 新しい状態をhook.memoizedStateに保存
        Note over R: 再レンダリングを続行
    else
        Note over R: 最適化：再レンダリングをスキップ可能
    end
```

## 厳格モードでの動作（開発環境のみ）

```mermaid
sequenceDiagram
    participant C as コンポーネント
    participant R as React
    participant F as Fiber

    Note over C,R: 開発環境 + 厳格モード

    C->>R: useState(() => createInitialState())を呼び出し
    R->>R: 厳格モードを検出

    R->>R: 初期化関数を1回目実行
    R->>R: 結果を破棄（副作用検出のため）

    R->>R: 初期化関数を2回目実行
    R->>F: 2回目の結果をhook.memoizedStateに保存

    R->>C: [状態, セッター関数]を返却

    Note over C,R: 状態更新時

    C->>R: setXxx(prev => doSomething(prev))を呼び出し
    R->>R: 厳格モードを検出

    R->>R: 更新関数を1回目実行
    R->>R: 結果を破棄（副作用検出のため）

    R->>R: 更新関数を2回目実行
    R->>F: 2回目の結果に基づいて更新を予定
```

## 複数の useState 呼び出しと連結リスト

```mermaid
sequenceDiagram
    participant C as コンポーネント
    participant R as React
    participant F as Fiber

    C->>R: 初回レンダリング

    C->>R: useState(initialA)を呼び出し
    R->>F: Fiber.memoizedState = hookA
    R->>C: [stateA, setStateA]を返却

    C->>R: useState(initialB)を呼び出し
    R->>F: hookA.next = hookB
    R->>C: [stateB, setStateB]を返却

    C->>R: useState(initialC)を呼び出し
    R->>F: hookB.next = hookC
    R->>C: [stateC, setStateC]を返却

    Note over F: Fiber.memoizedState -> hookA -> hookB -> hookC

    C->>R: 再レンダリング
    R->>F: currentHook = Fiber.memoizedState (hookA)

    C->>R: useState(initialA)を呼び出し
    R->>F: workInProgressHook = hookA
    R->>F: currentHook = hookA.next (hookB)
    R->>C: [stateA, setStateA]を返却

    C->>R: useState(initialB)を呼び出し
    R->>F: workInProgressHook = hookB
    R->>F: currentHook = hookB.next (hookC)
    R->>C: [stateB, setStateB]を返却

    C->>R: useState(initialC)を呼び出し
    R->>F: workInProgressHook = hookC
    R->>F: currentHook = hookC.next (null)
    R->>C: [stateC, setStateC]を返却
```

## 並行モードでの状態更新（React 18+）

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant C as コンポーネント
    participant S as セッター関数
    participant R as React
    participant F as Fiber
    participant Sch as Scheduler
    participant D as DOM

    Note over R,Sch: 並行モード有効

    U->>C: 低優先度のインタラクション
    C->>S: setState(newValue)
    S->>R: dispatchSetState実行
    R->>R: 低優先度レーンを割り当て
    R->>F: 更新をキューに追加
    R->>Sch: 低優先度の更新をスケジュール

    Note over Sch: レンダリング開始（中断可能）

    U->>C: 高優先度のインタラクション
    C->>S: 別のsetState(newValue2)
    S->>R: dispatchSetState実行
    R->>R: 高優先度レーンを割り当て
    R->>F: 別の更新をキューに追加
    R->>Sch: 高優先度の更新をスケジュール

    Sch->>R: 低優先度の作業を中断
    Sch->>R: 高優先度の更新を処理
    R->>C: 高優先度の更新でコンポーネントを再レンダリング
    R->>D: 高優先度の変更をDOMに適用

    Sch->>R: 中断された低優先度の作業を再開
    R->>R: 最新の状態に基づいて低優先度の更新を再計算
    R->>C: 低優先度の更新を反映してコンポーネントを再レンダリング
    R->>D: 低優先度の変更をDOMに適用
```

## キーの変更による状態リセット

```mermaid
sequenceDiagram
    participant P as 親コンポーネント
    participant R as React
    participant C1 as コンポーネント(key="A")
    participant F1 as Fiber(key="A")
    participant C2 as コンポーネント(key="B")
    participant F2 as Fiber(key="B")

    P->>R: <MyComponent key="A" />をレンダリング
    R->>C1: コンポーネントをマウント
    C1->>R: useState(initial)を呼び出し
    R->>F1: 状態を保存
    R->>P: レンダリング完了

    P->>R: <MyComponent key="B" />にkey変更
    R->>R: 新しいkeyを検出
    R->>C1: アンマウント
    R->>F1: Fiberとその状態を破棄

    R->>C2: 新しいコンポーネントをマウント
    C2->>R: useState(initial)を呼び出し
    R->>F2: 新しいFiberに初期状態を保存
    R->>P: レンダリング完了
```

## 注釈

### フックオブジェクトの構造

Fiber ノードに保存されるフックオブジェクトは、以下のような構造を持っています：

```javascript
{
  memoizedState: any,    // フックの現在の状態値
  baseState: any,        // 更新の基本となる状態
  queue: {               // 状態更新のキュー
    pending: null,       // 保留中の更新
    dispatch: Function,  // セッター関数（dispatchSetState）
    lastRenderedReducer: Function, // useState用の基本reducer
    lastRenderedState: any // 前回のレンダリング時の状態
  },
  next: Hook | null      // 次のフックへのポインタ（連結リスト）
}
```

### 更新オブジェクトの構造

キューに追加される更新オブジェクトの構造：

```javascript
{
  lane: Lane,            // 更新の優先度
  action: any,           // 新しい値または更新関数
  eagerReducer: null,    // 最適化用（すぐに適用可能な場合）
  eagerState: null,      // 最適化用（事前計算された状態）
  next: Update | null    // 次の更新へのポインタ（更新の連結リスト）
}
```

### 重要なポイント

1. **フックの連結リスト**：すべてのフックは、コンポーネントの Fiber ノードに連結リストとして保存されます。これが、フックが常に同じ順序で呼び出される必要がある理由です。

2. **バッチ処理**：React 18 以降では、すべての状態更新はデフォルトでバッチ処理されます。これにより、複数の状態更新があっても、再レンダリングは一度だけ発生します。

3. **Fiber アーキテクチャ**：useState 内部実装は、React の中断可能なレンダリングを可能にする Fiber アーキテクチャに深く統合されています。

4. **更新の優先順位**：React は「レーン」の概念を使用して、異なるタイプの更新に優先順位を付けます。ユーザーインタラクションからの更新は通常、高い優先順位を持ちます。

5. **状態の不変性**：React は内部的に Object.is を使用して状態の変更を検出します。オブジェクトや配列を状態として使用する場合、直接変更せず新しいオブジェクトを作成することが重要です。

6. **レンダリングの最適化**：同じ値での更新（Object.is で比較）の場合、React は最適化のために再レンダリングをスキップする場合があります。

7. **フックの呼び出し順序**：フックは常に同じ順序で呼び出す必要があります。条件付きでフックを呼び出すと、連結リストの整合性が崩れ、状態が正しく関連付けられなくなります。

8. **並行モード**：React 18 の並行モードでは、優先度に基づいて更新をスケジュールし、必要に応じてレンダリング作業を中断および再開できます。

9. **状態リセット**：key プロパティを変更すると、React はコンポーネントのインスタンスを完全に破棄して再作成し、すべての状態をリセットします。
