import os
import json
from google_auth_oauthlib.flow import InstalledAppFlow

# Google Drive yetkileri
SCOPES = ["https://www.googleapis.com/auth/drive"]

def get_refresh_token():
    """
    Kullanıcıyı tarayıcıda Google hesabına yönlendirerek giriş yapmasını sağlar
    ve uygulamanın arka planda her zaman Drive'a erişebilmesi için gerekli olan
    'refresh_token'ı üretir.
    """
    
    print("=" * 60)
    print("GOOGLE DRIVE OAUTH2 REFRESH TOKEN OLUŞTURUCU")
    print("=" * 60)
    print("\nLütfen başlamadan önce:")
    print("1. Google Cloud Console'da 'OAuth Client ID' (Desktop App) oluşturun.")
    print("2. İndirdiğiniz JSON dosyasını (client_secret_xxx.json) bu dizine kopyalayın.")
    print("3. Dosyanın tam adını aşağıya yazın veya 'credentials.json' olarak yeniden adlandırın.")
    print("-" * 60)
    
    client_secrets_file = input("Client Secret JSON dosyasının adı (varsayılan: credentials.json): ").strip()
    if not client_secrets_file:
        client_secrets_file = "credentials.json"
        
    if not os.path.exists(client_secrets_file):
        print(f"\nHATA: '{client_secrets_file}' dosyası bulunamadı!")
        print("Lütfen dosyayı bu betik ile aynı klasöre koyun ve tekrar deneyin.")
        return

    print("\nTarayıcınız açılıyor... Lütfen dosyalarınızın kaydedilmesini istediğiniz Google hesabı ile giriş yapın.")
    
    try:
        # OAuth akışını başlat
        flow = InstalledAppFlow.from_client_secrets_file(
            client_secrets_file, 
            SCOPES
        )
        
        # Local server başlatarak token bekle
        creds = flow.run_local_server(port=0)
        
        print("\n" + "=" * 60)
        print("BAŞARILI! Refresh Token alındı.")
        print("Lütfen aşağıdaki bilgileri .env dosyanıza veya sunucunuzdaki environment variable'lara ekleyin:")
        print("=" * 60)
        
        print(f"\nGOOGLE_CLIENT_ID={creds.client_id}")
        print(f"GOOGLE_CLIENT_SECRET={creds.client_secret}")
        print(f"GOOGLE_REFRESH_TOKEN={creds.refresh_token}")
        
        print("\n" + "=" * 60)
        print("DİKKAT: GOOGLE_REFRESH_TOKEN gizli bir bilgidir. Kimseyle paylaşmayın.")
        print("Google Cloud Console'da uygulamanızın 'Publishing Status'u 'Testing' ise,")
        print("bu token 7 gün sonra süresi dolacaktır. Bu süreyi kaldırmak için uygulamayı")
        print("'In production' olarak ayarlamanız gerekir.")
        print("=" * 60)
        
    except Exception as e:
        print(f"\nHata oluştu: {str(e)}")

if __name__ == "__main__":
    get_refresh_token()
