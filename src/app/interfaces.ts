export interface User {
        id: number;
        address: string;
        wallet: number;
        postalCode: string;
        registrationDate: Date;
        email: string;
        isLunchLady: boolean;
        name: string;
        firstname: string;
        phone: string;
        town: string;
        sex: number;
        status: number;
        imageId: number;
      }

export interface Credentials {
        email: string;
        password: string;
        status?: string;
      }
