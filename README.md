# Düğün Fotoğrafı Yükleme Uygulaması (Wedding Photo Upload App)

Bu uygulama, düğün misafirlerinin çektikleri özel anları ve fotoğrafları kolayca yükleyebilmeleri ve paylaşabilmeleri için tasarlanmış modern ve şık bir web uygulamasıdır. Yüklenen tüm medya dosyaları **Google Drive** üzerinde doğrudan sizin hesabınızda saklanır.

## 🚀 Özellikler

*   **Kolay Fotoğraf Yükleme:** Misafirler mobil veya masaüstü cihazlarından fotoğrafları hızlıca yükleyebilirler.
*   **Google Drive Depolama (OAuth2):** Tüm dosyalar kotası olan kişisel Google hesabınıza (veya Workspace hesabınıza) yüklenir. "Service account storage quota" hatalarını önler.
*   **Gelişmiş Fotoğraf Galerisi:** Yüklenen tüm fotoğraflar şık ve duyarlı (responsive) bir ızgara düzeninde görüntülenir.
*   **Görsel Detayı:** Görsellere tıklayarak tam boyutta inceleyebilirsiniz.
*   **Toplu İndirme:** "Tümünü İndir" butonuyla yüklenen tüm anıları indirebilirsiniz.
*   **Hızlı ve Modern Arayüz:** Vite + React + TypeScript kullanılarak geliştirilmiş, akıcı kullanıcı deneyimi.
*   **Güvenli Altyapı:** FastAPI backend ve Google Drive API entegrasyonu.

---

## 🛠️ Kurulum ve Çalıştırma

Proje **Frontend (Vite/React)** ve **Backend (FastAPI)** olmak üzere iki ana kısımdan oluşmaktadır.

### 1. Google Drive API (OAuth2) Konfigürasyonu

1.  [Google Cloud Console](https://console.cloud.google.com/)'a gidin ve projenizi seçin.
2.  **API'ler ve Hizmetler (APIs & Services) > OAuth Onay Ekranı (OAuth consent screen)** menüsünden uygulamanızı "External" (Harici) olarak yapılandırın. (Eğer test modunda bırakırsanız token 7 gün sonra iptal olur, bu yüzden *Publish App* diyerek Production'a almanız önerilir).
3.  **Kimlik Bilgileri (Credentials)** menüsüne gidin, **"Kimlik Bilgisi Oluştur (Create Credentials) > OAuth İstemci Kimliği (OAuth Client ID)"** seçin.
4.  Uygulama türü olarak **Masaüstü Uygulaması (Desktop App)** seçip oluşturun.
5.  JSON dosyasını bilgisayarınıza indirin ve adını `credentials.json` yaparak `backend` klasörünün içine atın.
6.  Python ortamınız aktifken terminalde şu komutu çalıştırın:
    ```bash
    python backend/get_refresh_token.py
    ```
7.  Açılan tarayıcı sekmesinde Google hesabınızla giriş yapıp izinleri onaylayın.
8.  Terminal ekranında size `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` ve `GOOGLE_REFRESH_TOKEN` bilgileri verilecektir.

### 2. Backend Kurulumu

1.  Bir Python sanal ortamı (virtual environment) oluşturup aktif edin:
    ```bash
    python -m venv .venv
    # Windows için:
    .venv\Scripts\activate
    # macOS/Linux için:
    source .venv/bin/activate
    ```
2.  Gerekli kütüphaneleri yükleyin:
    ```bash
    pip install -r backend/requirements.txt
    ```
3.  `.env` dosyasını oluşturun ve aldığınız token bilgilerini ekleyin:
    ```env
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=sifreniz
    SECRET_KEY=gizli-anahtar
    
    # Aşağıdaki bilgileri get_refresh_token.py'den alacaksınız:
    GOOGLE_CLIENT_ID=sizin_client_id_niz
    GOOGLE_CLIENT_SECRET=sizin_client_secret_niz
    GOOGLE_REFRESH_TOKEN=sizin_refresh_token_iniz
    
    # Opsiyonel: belirli bir Drive klasörüne yüklemek için
    # GOOGLE_DRIVE_FOLDER_ID=klasor_id
    ```
4.  Backend sunucusunu başlatın:
    ```bash
    python -m uvicorn backend.main:app --port 8000 --reload
    ```
    *Backend `http://localhost:8000` adresinde çalışacaktır.*

### 3. Frontend Kurulumu

1.  `frontend` dizinine geçiş yapın:
    ```bash
    cd frontend
    ```
2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3.  Geliştirme sunucusunu başlatın:
    ```bash
    npm run dev
    ```
    *Frontend `http://localhost:5173` adresinde çalışacaktır.*

---

## 📦 Teknolojiler

*   **Frontend:** React, Vite, TypeScript, Lucide Icons, Vanilla CSS
*   **Backend:** Python, FastAPI, Uvicorn
*   **Depolama:** Google Drive API (OAuth2 User Delegation)
*   **Kimlik Doğrulama:** JWT (JSON Web Token)