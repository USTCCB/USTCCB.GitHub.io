from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

chrome_options = Options()
chrome_options.add_argument('--headless=new')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--disable-dev-shm-usage')

try:
    driver = webdriver.Chrome(options=chrome_options)
    driver.get('https://ustc.chat/myBlogs.html')

    # 等待页面加载
    time.sleep(3)

    # 获取控制台日志
    logs = driver.get_log('browser')
    print("=== BROWSER CONSOLE LOGS ===")
    for log in logs[:30]:
        print(f"[{log['level']}] {log['message']}")

    # 获取 blogList 内容
    blog_list = driver.find_element(By.ID, 'blogList')
    print(f"\n=== BLOG LIST HTML ===")
    print(blog_list.get_attribute('innerHTML')[:500])

    # 获取 blogs 变量
    blogs_count = driver.execute_script('return typeof blogs !== "undefined" ? blogs.length : "undefined"')
    print(f"\n=== BLOGS COUNT ===")
    print(blogs_count)

    driver.quit()
except Exception as e:
    print(f"Error: {e}")
