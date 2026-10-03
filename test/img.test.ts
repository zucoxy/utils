import { describe, expect, it, vi } from 'vitest';
import { compressionImage } from '../src/img';

describe('compressionImage', () => {
  it('非 File 输入时告警并原样返回', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fake = {} as File;
    await expect(compressionImage(fake, 'image/jpeg')).resolves.toBe(fake);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
