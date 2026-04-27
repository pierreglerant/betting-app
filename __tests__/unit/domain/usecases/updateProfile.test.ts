import { updateProfileUseCase } from '@/domain/usecases/updateProfile';
import type { AvatarStorage } from '@/domain/repositories/AvatarStorage';
import type { ProfileRepository } from '@/domain/repositories/ProfileRepository';

describe('updateProfileUseCase', () => {
  function makeProfileRepositoryMock() {
    return {
      updateUsername: jest.fn(),
      updateAvatarUrl: jest.fn(),
    } as unknown as jest.Mocked<ProfileRepository>;
  }

  function makeAvatarStorageMock() {
    return {
      uploadAvatar: jest.fn(),
    } as unknown as jest.Mocked<AvatarStorage>;
  }

  it('updates the username when username is provided', async () => {
    const profileRepository = makeProfileRepositoryMock();
    const avatarStorage = makeAvatarStorageMock();

    profileRepository.updateUsername.mockResolvedValue(undefined);

    const result = await updateProfileUseCase(profileRepository, avatarStorage, {
      userId: ' user-1 ',
      username: ' pierre ',
    });

    expect(profileRepository.updateUsername).toHaveBeenCalledTimes(1);
    expect(profileRepository.updateUsername).toHaveBeenCalledWith('user-1', 'pierre');
    expect(avatarStorage.uploadAvatar).not.toHaveBeenCalled();
    expect(profileRepository.updateAvatarUrl).not.toHaveBeenCalled();
    expect(result).toEqual({ username: 'pierre' });
  });

  it('updates the avatar when avatar data is provided', async () => {
    const profileRepository = makeProfileRepositoryMock();
    const avatarStorage = makeAvatarStorageMock();

    avatarStorage.uploadAvatar.mockResolvedValue('https://example.com/avatar.png');
    profileRepository.updateAvatarUrl.mockResolvedValue(undefined);

    const result = await updateProfileUseCase(profileRepository, avatarStorage, {
      userId: 'user-1',
      avatarBase64: 'base64-data',
      avatarMimeType: 'image/png',
    });

    expect(avatarStorage.uploadAvatar).toHaveBeenCalledTimes(1);
    expect(avatarStorage.uploadAvatar).toHaveBeenCalledWith('user-1', 'base64-data', 'image/png');
    expect(profileRepository.updateAvatarUrl).toHaveBeenCalledTimes(1);
    expect(profileRepository.updateAvatarUrl).toHaveBeenCalledWith(
      'user-1',
      'https://example.com/avatar.png',
    );
    expect(result).toEqual({ avatarUrl: 'https://example.com/avatar.png' });
  });

  it('updates both username and avatar when both are provided', async () => {
    const profileRepository = makeProfileRepositoryMock();
    const avatarStorage = makeAvatarStorageMock();

    profileRepository.updateUsername.mockResolvedValue(undefined);
    avatarStorage.uploadAvatar.mockResolvedValue('https://example.com/avatar.png');
    profileRepository.updateAvatarUrl.mockResolvedValue(undefined);

    const result = await updateProfileUseCase(profileRepository, avatarStorage, {
      userId: 'user-1',
      username: 'pierre',
      avatarBase64: 'base64-data',
      avatarMimeType: 'image/png',
    });

    expect(profileRepository.updateUsername).toHaveBeenCalledTimes(1);
    expect(avatarStorage.uploadAvatar).toHaveBeenCalledTimes(1);
    expect(profileRepository.updateAvatarUrl).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      username: 'pierre',
      avatarUrl: 'https://example.com/avatar.png',
    });
  });

  it('throws when userId is empty', async () => {
    const profileRepository = makeProfileRepositoryMock();
    const avatarStorage = makeAvatarStorageMock();

    await expect(
      updateProfileUseCase(profileRepository, avatarStorage, {
        userId: '',
        username: 'pierre',
      }),
    ).rejects.toThrow('User id is required');

    expect(profileRepository.updateUsername).not.toHaveBeenCalled();
  });

  it('throws when no profile field is provided', async () => {
    const profileRepository = makeProfileRepositoryMock();
    const avatarStorage = makeAvatarStorageMock();

    await expect(
      updateProfileUseCase(profileRepository, avatarStorage, {
        userId: 'user-1',
      }),
    ).rejects.toThrow('At least one profile field is required');

    expect(profileRepository.updateUsername).not.toHaveBeenCalled();
    expect(avatarStorage.uploadAvatar).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    const profileRepository = makeProfileRepositoryMock();
    const avatarStorage = makeAvatarStorageMock();

    profileRepository.updateUsername.mockRejectedValue(new Error('Database error'));

    await expect(
      updateProfileUseCase(profileRepository, avatarStorage, {
        userId: 'user-1',
        username: 'pierre',
      }),
    ).rejects.toThrow('Database error');

    expect(profileRepository.updateUsername).toHaveBeenCalledTimes(1);
  });
});
