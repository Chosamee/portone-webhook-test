import express from "express";
import bodyParser from "body-parser";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath = path.join(__dirname, "../localhost-key.pem");
const certPath = path.join(__dirname, "../localhost.pem");

const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
};

// Express 앱 초기화
const app = express();

// JSON 요청 본문을 파싱하기 위해 bodyParser.json() 미들웨어 사용
app.use(bodyParser.json());

// 환경변수 설정
const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET;

// POST 요청을 받는 /portone-webhook 라우트
app.post("/portone-webhook", async (req, res) => {
    console.log("??");
    try {
        const { payment_id: paymentId } = req.body;

        // Portone 결제내역 단건조회 API 호출
        const paymentResponse = await fetch(
            `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
            {
                headers: {
                    Authorization: `PortOne ${PORTONE_API_SECRET}`,
                },
            }
        );
        if (!paymentResponse.ok) throw new Error(`signinResponse: ${paymentResponse.statusText}`);
        const { id, status, amount, method } = await paymentResponse.json();

        // // 내부 주문 데이터 조회 로직 (예시 OrderService)
        // const order = await OrderService.findById(id);
        // if (order.amount === amount.total) {
        //     switch (status) {
        //         case "VIRTUAL_ACCOUNT_ISSUED":
        //             // 가상 계좌 발급 로직
        //             break;
        //         case "PAID":
        //             // 결제 완료 로직
        //             break;
        //     }
        // } else {
        //     // 결제 금액 불일치 처리
        //     res.status(400).send("Payment amount does not match");
        // }
    } catch (e) {
        res.status(400).send(`Error: ${e.message}`);
    }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
const httpsServer = https.createServer(httpsOptions, app);

httpsServer.listen(PORT, () => {
    console.log("HTTPS server running on port 3000");
});
