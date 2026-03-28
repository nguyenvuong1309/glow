import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ProfileUpdatePayload } from '@/types';

interface ProfileState {
  updating: boolean;
  uploadingAvatar: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  updating: false,
  uploadingAvatar: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfileRequest(state, _action: PayloadAction<ProfileUpdatePayload>) {
      state.updating = true;
      state.error = null;
    },
    updateProfileSuccess(state) {
      state.updating = false;
    },
    updateProfileFailure(state, action: PayloadAction<string | undefined>) {
      state.updating = false;
      state.error = action.payload ?? 'Failed to update profile';
    },
    uploadAvatarRequest(state, _action: PayloadAction<{ uri: string; fileName: string; type: string }>) {
      state.uploadingAvatar = true;
      state.error = null;
    },
    uploadAvatarSuccess(state) {
      state.uploadingAvatar = false;
    },
    uploadAvatarFailure(state, action: PayloadAction<string | undefined>) {
      state.uploadingAvatar = false;
      state.error = action.payload ?? 'Failed to upload avatar';
    },
  },
});

export const {
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
  uploadAvatarRequest,
  uploadAvatarSuccess,
  uploadAvatarFailure,
} = profileSlice.actions;
export default profileSlice.reducer;
