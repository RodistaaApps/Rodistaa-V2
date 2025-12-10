/**
 * Image Picker utility - Web implementation
 * Replaces expo-image-picker for web platform
 */

export interface ImagePickerResult {
  cancelled: boolean;
  uri?: string;
  width?: number;
  height?: number;
  type?: string;
}

export const ImagePicker = {
  async requestMediaLibraryPermissionsAsync(): Promise<{ status: string }> {
    return { status: 'granted' };
  },

  async requestCameraPermissionsAsync(): Promise<{ status: string }> {
    return { status: 'granted' };
  },

  async launchImageLibraryAsync(options?: any): Promise<ImagePickerResult> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            resolve({
              cancelled: false,
              uri: event.target.result,
              type: file.type,
            });
          };
          reader.readAsDataURL(file);
        } else {
          resolve({ cancelled: true });
        }
      };

      input.oncancel = () => {
        resolve({ cancelled: true });
      };

      input.click();
    });
  },

  async launchCameraAsync(options?: any): Promise<ImagePickerResult> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            resolve({
              cancelled: false,
              uri: event.target.result,
              type: file.type,
            });
          };
          reader.readAsDataURL(file);
        } else {
          resolve({ cancelled: true });
        }
      };

      input.oncancel = () => {
        resolve({ cancelled: true });
      };

      input.click();
    });
  },
};

