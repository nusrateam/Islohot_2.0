# 📱 ISLOHOT — Android APK Tayyorlash Qo'llanmasi

Ushbu loyiha **Capacitor** asosida Android smartfonlar uchun to'liq moslashtirilgan.

Ilova ichidagi API so'rovlari avtomatik tarzda `https://islohot.vercel.app` serveriga ulanadi va internet bo'lmaganda ham 100% oflayn ishlaydi.

---

## 🚀 APK Olishning 3 Xil Oson Usuli:

### 1-USUL: GitHub Actions orqali Avtomatik (Eng oson, bepul va kompyuteringizni qiynamaydi!)

Ushbu papka ichida `.github/workflows/build-apk.yml` fayli sozlangan.

1. GitHub'da yangi repozitoriy oching (masalan, `islohot-app`).
2. Ushbu `islohot` papkasidagi fayllarni GitHub repozitoriyingizga yuklang (push qiling).
3. GitHub sahifangizda **"Actions"** bo'limiga o'ting.
4. **"Build Islohot Android APK"** avtomatik ishga tushadi (taxminan 2-3 daqiqa davom etadi).
5. Ish yakunlangach, **"Artifacts"** bo'limidan tayyor **`Islohot-App-v2.apk`** faylini to'g'ridan-to'g'ri yuklab olib, telefoningizga o'rnatasiz!

---

### 2-USUL: PWABuilder Orqali (1 daqiqada onlayn)

Loyiha to'liq PWA standartlariga ega:
1. Brauzeringizda **[PWABuilder.com](https://www.pwabuilder.com/)** saytiga kiring.
2. Sayt manzilingizni kiriting: `https://islohot.vercel.app/` va **"Start"** ni bosing.
3. **"Package for Stores"** -> **"Android"** ni tanlang.
4. **"Generate APK"** tugmasini bosing va tayyor Android ilovani yuklab oling!

---

### 3-USUL: Kompyuterda Android Studio orqali

Agar kompyuteringizda Node.js va Android Studio o'rnatilgan bo'lsa:
1. Ushbu papkada terminalni oching:
   ```bash
   npm install
   npx cap add android
   npx cap sync android
   npx cap open android
   ```
2. Android Studio ochilgach, yuqori menyudan **Build -> Build Bundle(s) / APK(s) -> Build APK(s)** ni bosing.
3. Bir necha daqiqada APK tayyor bo'ladi.
