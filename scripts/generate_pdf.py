import os
import json
import sys
from pathlib import Path
from google import genai
from google.genai.errors import ClientError
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from xml.sax.saxutils import escape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont

industry = os.environ["INDUSTRY"]
role = os.environ["ROLE"]
job_id = os.environ["JOB_ID"]

out_dir = Path("docs/results") / job_id
out_dir.mkdir(parents=True, exist_ok=True)

status_path = out_dir / "status.json"
pdf_path = out_dir / "proposal.pdf"

prompt = f"""

# 企業における「置きベン（誰でも自由に座れるベンチ）」導入の価値を徹底的に考える

あなたは世界最高レベルの経営コンサルタント、都市計画家、人事責任者、マーケティング責任者、CSR担当者、建築家、行動経済学者、社会学者、心理学者、投資家、自治体職員、地域コミュニティデザイナーです。

企業が「置きベン（会社敷地内・会社前・地域に自由に座れるベンチを設置する活動）」を実施するとします。

目的は「人が座ること」ではなく、「偶発的な出会い」「対話」「地域との関係」「企業文化の醸成」を生み出すことです。

## 顧客像
クライアントは「{industry}」という業種の「{role}」という役職についています。

## 課題

「置きベンは社会的に良いこと」で終わらせず、

**企業にとって投資対効果（ROI）が成立する仕組み**

を考えてください。

---

## 以下の視点を最低でもすべて検討してください。

### ① 人事・採用

* 採用ブランド
* エンゲージメント
* 離職率
* 心理的安全性
* オンボーディング
* 社員同士の偶発的交流

---

### ② マーケティング

* ブランド価値
* SNS拡散
* PR
* 地域認知
* ファンづくり

---

### ③ 営業

* 新しい顧客接点
* 信頼形成
* 商談創出
* 地域企業とのネットワーク

---

### ④ CSR・ESG・SDGs

* 地域貢献
* ESG評価
* SDGsとの関係
* 行政との連携

---

### ⑤ 財務

* 導入コスト
* 維持費
* 費用対効果
* 数字で測れるKPI
* 3年後・5年後の投資回収モデル

---

### ⑥ 行動経済学・心理学

* 人はなぜベンチに座るのか
* 会話はどう生まれるのか
* 会社への印象はどう変わるか
* 信頼形成への影響

---

### ⑦ 建築・都市計画

* ベンチ配置
* 人の流れ
* 滞留時間
* 公共空間との接続
* 景観デザイン

---

### ⑧ 法務・リスク

* クレーム
* 防犯
* 事故
* 管理責任
* 運用ルール

---

### ⑨ 地域コミュニティ

* 高齢者
* 子ども
* 学生
* 観光客
* 障害者
* 外国人

それぞれにどのような価値を提供できるか。

---

### ⑩ 会社内部

社内だけに置いた場合

社外だけに置いた場合

両方置いた場合

それぞれのメリット・デメリットを比較してください。

---

## さらに発想を広げてください

以下の企業の成功要因も参考にしてください。

* Apple
* Starbucks
* IKEA
* Patagonia
* Disney
* Google
* Toyota
* 無印良品
* 蔦屋書店

「なぜこれらの企業は人が集まるのか」

という観点から置きベンへ応用してください。

---

## アイデア出し

最低100個のアイデアを出してください。

その中から

* 実現性
* コスト
* 効果
* 面白さ
* 独創性

で評価し、ベスト20を選んでください。

---

## 最後に

「もし世界一成功する置きベン活動を設計するとしたら」

という前提で、

* コンセプト
* 運営方法
* KPI
* 年間イベント
* 社員の巻き込み方
* 地域の巻き込み方
* 行政との連携
* メディア戦略
* 将来的な事業化・ブランド化

まで含めて、一つの完成されたビジネスモデルとして提案してください。

単なるベンチ設置ではなく、「人と人との関係を育てるインフラ」として設計してください。

出力はMarkdown表を使わず、見出しと箇条書き中心で作成してください。
HTMLタグは使わないでください。

"""

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

try:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    text = response.text or "生成結果が空でした。"
    
    pdfmetrics.registerFont(UnicodeCIDFont("HeiseiKakuGo-W5"))
    pdfmetrics.registerFont(UnicodeCIDFont("HeiseiMin-W3"))

    doc = SimpleDocTemplate(str(pdf_path), pagesize=A4)
    styles = getSampleStyleSheet()

    styles["Title"].fontName = "HeiseiKakuGo-W5"
    styles["BodyText"].fontName = "HeiseiMin-W3"
    styles["BodyText"].fontSize = 10
    styles["BodyText"].leading = 16
    story = []

    story.append(Paragraph("置きベン活動 企画書", styles["Title"]))
    story.append(Spacer(1, 16))
    
    
    safe_text = text.replace("<br>", "\n").replace("<br/>", "\n")

    for line in safe_text.split("\n"):
        if line.strip():
            story.append(Paragraph(escape(line), styles["BodyText"]))
            story.append(Spacer(1, 8))

    doc.build(story)

    status = {
        "status": "success",
        "pdf_url": f"./results/{job_id}/proposal.pdf"
    }

except ClientError as e:
    if getattr(e, "code", None) == 429:
        status = {
            "status": "quota_exceeded",
            "message": "申し訳ありません。無料枠切れです。しばらくたってから表示下さい"
        }
    else:
        status = {
            "status": "error",
            "message": str(e)
        }

except Exception as e:
    status = {
        "status": "error",
        "message": str(e)
    }

with status_path.open("w", encoding="utf-8") as f:
    json.dump(status, f, ensure_ascii=False, indent=2)

if status["status"] != "success":
    sys.exit(0)