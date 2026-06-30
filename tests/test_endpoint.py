import requests

def test():
    try:
        # 1. Upload
        files = {'file': open('test.xml', 'rb')}
        res = requests.post('http://127.0.0.1:8001/api/upload', files=files)
        print("Upload status:", res.status_code)
        upload_data = res.json()
        print("Upload data:", upload_data)
        file_id = upload_data['file_id']
        
        # 2. Profile
        res = requests.post(f'http://127.0.0.1:8001/api/profile/{file_id}')
        print("Profile status:", res.status_code)
        print("Profile data (keys):", res.json().keys() if res.status_code == 200 else res.text)
        
        # 3. Analysis
        res = requests.get(f'http://127.0.0.1:8001/api/analysis/{file_id}')
        print("Analysis status:", res.status_code)
        print("Analysis response:", res.text)
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    test()
