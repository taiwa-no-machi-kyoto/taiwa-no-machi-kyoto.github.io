# 対話之町京都ヲ目指ス上京 公式ホームページ

GitHub Pagesで公開できる、HTML / CSS / JavaScriptのみの静的サイトです。

## ファイル構成

```text
.
├── index.html
├── style.css
├── script.js
└── README.md
```

## GitHub Pagesで公開する手順

1. GitHubで新しいリポジトリを作成します。
2. `index.html`、`style.css`、`script.js`、`README.md` をアップロードします。
3. リポジトリの `Settings` を開きます。
4. 左メニューから `Pages` を開きます。
5. `Build and deployment` の `Source` を `Deploy from a branch` にします。
6. `Branch` を `main`、フォルダを `/root` にして保存します。
7. 数分後、GitHub PagesのURLが表示されます。

## 連絡先を変更する方法

`index.html` の以下の部分を編集してください。

```html
<a class="button button--primary" href="mailto:example@example.com">メールする</a>
```

`example@example.com` を実際のメールアドレスに変更します。

SNSリンクは以下の部分を変更してください。

```html
<a class="button button--ghost" href="#" aria-label="SNSリンク">SNSリンク</a>
```

`#` をSNSのURLに変更します。

## 画像を追加する場合

現在のサイトは画像がなくても成立するように、CSSで雰囲気を作っています。

画像を追加する場合は、以下のような構成にしてください。

```text
.
├── index.html
├── style.css
├── script.js
├── README.md
└── img
    ├── bench.jpg
    └── machi.jpg
```

画像を使う場合は、`index.html` の任意の場所に以下のように追加できます。

```html
<img src="./img/bench.jpg" alt="町に置かれたベンチ" />
```

## メンテナンスを最小限にする運用方法

- 開催日や最新情報を細かく載せすぎない
- 「活動の考え方」「参加のしかた」「問い合わせ先」を中心にする
- イベント情報はSNSや別サービスに任せる
- ホームページは名刺・案内板として使う
- 文章は年1回程度だけ見直す

## 注意

このサイトは、地域活動を紹介するためのものです。
医療的効果や専門的支援を断定する表現は避けています。
必要な支援がある場合は、専門機関や相談窓口の利用も検討してください。
