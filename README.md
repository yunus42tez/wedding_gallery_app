# Düğün Fotoğrafı Yükleme Uygulaması (Wedding Photo Upload App)

Bu uygulama, düğün misafirlerinin çektikleri özel anları ve fotoğrafları kolayca yükleyebilmeleri ve paylaşabilmeleri için tasarlanmış modern ve şık bir web uygulamasıdır. Yüklenen tüm medya dosyaları **Google Drive** üzerinde güvenle saklanır.

## 🚀 Özellikler

*   **Kolay Fotoğraf Yükleme:** Misafirler mobil veya masaüstü cihazlarından fotoğrafları hızlıca yükleyebilirler.
*   **Google Drive Depolama:** Tüm dosyalar güvenli bir şekilde Google Drive'a yüklenir.
*   **Gelişmiş Fotoğraf Galerisi:** Yüklenen tüm fotoğraflar şık ve duyarlı (responsive) bir ızgara düzeninde görüntülenir.
*   **Görsel Detayı:** Görsellere tıklayarak tam boyutta inceleyebilirsiniz.
*   **Toplu İndirme:** "Tümünü İndir" butonuyla yüklenen tüm anıları indirebilirsiniz.
*   **Hızlı ve Modern Arayüz:** Vite + React + TypeScript kullanılarak geliştirilmiş, akıcı kullanıcı deneyimi.
*   **Güvenli Altyapı:** FastAPI backend ve Google Drive API entegrasyonu.

---

## 🛠️ Kurulum ve Çalıştırma

Proje **Frontend (Vite/React)** ve **Backend (FastAPI)** olmak üzere iki ana kısımdan oluşmaktadır.

### 1. Google Drive API Konfigürasyonu

1.  [Google Cloud Console](https://console.cloud.google.com/) üzerinden bir proje oluşturun.
2.  **Google Drive API**'yi etkinleştirin.
3.  Bir **Service Account** oluşturun ve JSON key dosyasını indirin.
4.  İndirdiğiniz JSON dosyasını `backend/credentials/service_account.json` olarak kaydedin.
5.  (Opsiyonel) Google Drive'da bir klasör oluşturup, bu klasörü service account e-posta adresine paylaşın.

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
3.  `.env` dosyasını oluşturun:
    ```env
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=sifreniz
    SECRET_KEY=gizli-anahtar
    # Opsiyonel: belirli bir Drive klasörüne yüklemek için
    # GOOGLE_DRIVE_FOLDER_ID=klasor_id
    # Production: JSON credentials'ı env variable olarak verin
    # GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
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

## 🔐 Credential Güvenliği

- `backend/credentials/` klasörü `.gitignore` dosyasında tanımlıdır ve **asla** GitHub'a yüklenmez.
- Production ortamında `GOOGLE_SERVICE_ACCOUNT_JSON` environment variable olarak JSON string şeklinde verilmelidir.

---

## 📦 Teknolojiler

*   **Frontend:** React, Vite, TypeScript, Lucide Icons, Vanilla CSS
*   **Backend:** Python, FastAPI, Uvicorn
*   **Depolama:** Google Drive API (Service Account)
*   **Kimlik Doğrulama:** JWT (JSON Web Token)