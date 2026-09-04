export interface CpuRegisters {
  eax: string;
  ebx: string;
  ecx: string;
  edx: string;
  esi: string;
  edi: string;
  esp: string; // Stack Pointer
  ebp: string; // Base Pointer
  eip: string; // Instruction Pointer
  eflags: string;
}

export interface StackFrameEntry {
  address: string;
  rawHex: string;
  annotation: string;
  isCorrupted?: boolean;
}

export interface DisassemblyInstruction {
  address: string;
  opcodes: string;
  mnemonic: string;
  operands: string;
  comment?: string;
}

export interface MemoryExploitAnalysis {
  registers: CpuRegisters;
  stack: StackFrameEntry[];
  instructions: DisassemblyInstruction[];
  isEipHijacked: boolean;
  hijackOffset?: number;
  securityMitigations: {
    aslr: boolean;
    depNx: boolean;
    stackCanary: boolean;
    relro: 'Full' | 'Partial' | 'None';
  };
}

/**
 * StackMemoryVisualizer
 * Deterministic visualization adapter for teaching x86 buffer layout, stack frames,
 * and EIP overwrite mechanics. This is a pedagogical visualizer, NOT a hardware x86 emulator.
 */
export class StackMemoryVisualizer {
  private baseState: MemoryExploitAnalysis;

  constructor() {
    this.baseState = this.getInitialExploitState();
  }

  public getInitialExploitState(): MemoryExploitAnalysis {
    return {
      registers: {
        eax: '0x00000001',
        ebx: '0x56556ff4',
        ecx: '0xffffd120',
        edx: '0x00000000',
        esi: '0xf7fb5000',
        edi: '0xf7fb5000',
        esp: '0xffffd0c0',
        ebp: '0xffffd0f8',
        eip: '0x08048496',
        eflags: '0x00000282 [CF IF]',
      },
      stack: [
        {
          address: '0xffffd0c0',
          rawHex: '0x08048560',
          annotation: 'Local Buffer [0..4]',
        },
        {
          address: '0xffffd0c4',
          rawHex: '0x00000000',
          annotation: 'Local Buffer [4..8]',
        },
        {
          address: '0xffffd0f4',
          rawHex: '0x00000000',
          annotation: 'Local Buffer [52..56]',
        },
        {
          address: '0xffffd0f8',
          rawHex: '0xffffd118',
          annotation: 'Saved EBP (Frame Pointer)',
        },
        {
          address: '0xffffd0fc',
          rawHex: '0x080484c2',
          annotation: 'Saved EIP (Return Address)',
        },
      ],
      instructions: [
        { address: '0x0804848b', opcodes: '55', mnemonic: 'push', operands: 'ebp' },
        {
          address: '0x0804848c',
          opcodes: '89 e5',
          mnemonic: 'mov',
          operands: 'ebp, esp',
        },
        {
          address: '0x0804848e',
          opcodes: '83 ec 40',
          mnemonic: 'sub',
          operands: 'esp, 0x40',
          comment: 'Allocate 64-byte stack frame',
        },
        {
          address: '0x08048491',
          opcodes: '8d 45 d8',
          mnemonic: 'lea',
          operands: 'eax, [ebp-0x28]',
        },
        { address: '0x08048494', opcodes: '50', mnemonic: 'push', operands: 'eax' },
        {
          address: '0x08048495',
          opcodes: 'e8 ac fe ff ff',
          mnemonic: 'call',
          operands: 'gets',
          comment: 'VULNERABLE: gets() with no bounds check',
        },
        { address: '0x0804849a', opcodes: 'c9', mnemonic: 'leave', operands: '' },
        {
          address: '0x0804849b',
          opcodes: 'c3',
          mnemonic: 'ret',
          operands: '',
          comment: 'Return to saved EIP',
        },
      ],
      isEipHijacked: false,
      securityMitigations: {
        aslr: false,
        depNx: false,
        stackCanary: false,
        relro: 'None',
      },
    };
  }

  public testPayload(payloadString: string): MemoryExploitAnalysis {
    const analysis = this.getInitialExploitState();
    const len = payloadString.length;

    // Buffer is 44 bytes before saved EBP, 4 bytes EBP, 4 bytes EIP (total 52 bytes)
    if (len >= 52) {
      analysis.isEipHijacked = true;
      analysis.hijackOffset = 52;
      analysis.registers.eip = '0x41414141'; // Overwritten with 'AAAA' or payload bytes
      analysis.registers.esp = '0xffffd100';

      // Update stack view
      analysis.stack = [
        {
          address: '0xffffd0c0',
          rawHex: '0x41414141',
          annotation: 'Buffer Overflow Payload ("AAAA")',
          isCorrupted: true,
        },
        {
          address: '0xffffd0f4',
          rawHex: '0x41414141',
          annotation: 'Buffer Overflow Payload ("AAAA")',
          isCorrupted: true,
        },
        {
          address: '0xffffd0f8',
          rawHex: '0x41414141',
          annotation: 'OVERWRITTEN Saved EBP (0x41414141)',
          isCorrupted: true,
        },
        {
          address: '0xffffd0fc',
          rawHex: '0x41414141',
          annotation: 'CRITICAL: HIJACKED Saved EIP (0x41414141)',
          isCorrupted: true,
        },
      ];
    }

    return analysis;
  }
}
