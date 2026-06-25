# Düğün Fotoğrafı Yükleme Uygulaması (Wedding Photo Upload App)

Bu uygulama, düğün misafirlerinin çektikleri özel anları ve fotoğrafları kolayca yükleyebilmeleri ve paylaşabilmeleri için tasarlanmış modern ve şık bir web uygulamasıdır.

## 🚀 Özellikler

*   **Kolay Fotoğraf Yükleme:** Misafirler mobil veya masaüstü cihazlarından fotoğrafları hızlıca yükleyebilirler.
*   **Gelişmiş Fotoğraf Galerisi:** Yüklenen tüm fotoğraflar şık ve duyarlı (responsive) bir ızgara düzeninde görüntülenir.
*   **Görsel Detayı:** Görsellere tıklayarak tam boyutta inceleyebilirsiniz.
*   **Toplu İndirme:** "Tümünü İndir" butonuyla yüklenen tüm anıları tek tıkla arşiv olarak indirebilirsiniz.
*   **Hızlı ve Modern Arayüz:** Vite + React + TypeScript kullanılarak geliştirilmiş, akıcı kullanıcı deneyimi.
*   **Güvenli Altyapı:** FastAPI backend ve SQLite veritabanı entegrasyonu.

---

## 🛠️ Kurulum ve Çalıştırma

Proje **Frontend (Vite/React)** ve **Backend (FastAPI)** olmak üzere iki ana kısımdan oluşmaktadır.

### 1. Backend Kurulumu

1.  `backend` dizinine gidin veya ana dizinde kalın. Bir Python sanal ortamı (virtual environment) oluşturup aktif edin:
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
3.  `.env` dosyasını oluşturun ve gerekli yapılandırmaları yapın (örn. `.env.example` dosyasını referans alabilirsiniz).
4.  Backend sunucusunu başlatın:
    ```bash
    python -m uvicorn backend.main:app --port 8000 --reload
    ```
    *Backend `http://localhost:8000` adresinde çalışacaktır.*

### 2. Frontend Kurulumu

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
*   **Backend:** Python, FastAPI, SQLAlchemy, Alembic, Uvicorn
*   **Veritabanı:** SQLite