import { mapOption } from '@/infrastructure/db/mappers/option';

describe('mapOption', () => {
  it('map option DTO to domain option', () => {
    const dto = {
      id: 'option-1',
      bet_id: 'bet-1',
      value: 'yes',
    };

    const result = mapOption(dto);

    expect(result).toStrictEqual({
      id: 'option-1',
      betId: 'bet-1',
      value: 'yes',
    });
  });
});
