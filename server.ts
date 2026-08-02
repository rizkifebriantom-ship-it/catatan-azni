import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Shared Gemini AI instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint for cute AI spending analysis & 30-day conclusion
app.post("/api/ai-analysis", async (req, res) => {
  try {
    const { totalExpenses, transactionCount, categoryBreakdown, topExpense, periodDays, dailyAverage } = req.body;

    const prompt = `Kamu adalah CatatYuk AI Buddy 🐱✨, seorang teman pribadi yang ceria, penyabar, lucu, dan super suportif yang membantu pengguna memahami pengeluaran pribadi mereka.

Berikut adalah data pengeluaran pengguna selama ${periodDays || 30} hari terakhir:
- Total Pengeluaran: Rp ${Number(totalExpenses).toLocaleString('id-ID')}
- Total Transaksi: ${transactionCount} transaksi
- Rata-rata per hari: Rp ${Number(dailyAverage || 0).toLocaleString('id-ID')}
- Pengeluaran Terbesar: ${topExpense ? `${topExpense.note || topExpense.category} (Rp ${Number(topExpense.amount).toLocaleString('id-ID')})` : 'Belum ada'}
- Rincian Per Kategori:
${Array.isArray(categoryBreakdown) ? categoryBreakdown.map((c: { category: string; icon: string; total: number; count: number }) => `  * ${c.icon || ''} ${c.category}: Rp ${Number(c.total).toLocaleString('id-ID')} (${c.count}x)`).join('\n') : 'Tidak ada data'}

Tugasmu:
Buat laporan & kesimpulan ramah, lucu, dan penuh empati dalam Bahasa Indonesia santai (gunakan emotikon lucu seperti 😺, ☕, 🍱, 💸, ✨).
Format responsmu secara terstruktur dalam 3-4 paragraf singkat:
1. **Pujian & Evaluasi Ceria**: Berikan reaksi ramah dan apresiasi atas kedisiplinan mencatat.
2. **Sorotan Pengeluaran Utama**: Bahas di mana uang paling banyak mengalir (misal jajan kopi atau makan) dengan nada bercanda tapi positif.
3. **Tips Hemat Praktis & Lucu**: Berikan 2 tips konkret dan mudah yang relevan dengan pola pengeluaran ini agar bulan depan bisa tabung lebih banyak!
4. **Kalimat Penutup Apresiatif**: Berikan ucapan penyemangat singkat.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const analysisText = response.text || "Terima kasih sudah rajin mencatat! Yuk teruskan kebiasaan baik ini 😊✨";

    res.json({
      success: true,
      analysis: analysisText,
    });
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    res.status(500).json({
      success: false,
      error: "Gagal membuat analisis AI. Pastikan jaringan aman atau coba lagi nanti ya!",
      details: error.message,
    });
  }
});

async function startServer() {
  // Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CatatYuk server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
