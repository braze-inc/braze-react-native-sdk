declare module 'react-native-appboy-sdk' {
    module ReactAppboy {
        enum Genders {
            Male = 'm',
            Female = 'f',
        }

        // export function getInitialURL(callback: (result: string) => void): void;
        export function changeUser(userId: string): void;
        export function registerPushToken(token: string): void;
        export function logCustomEvent(eventName: string, eventProperties?: { [index: string]: string|number|boolean }): void;
        // export function logPurchase
        // export function submitFeedback
        export function setCustomUserAttribute(key: string, value: string|string[]|number|boolean|Date,
            callback: (error: string, result: string) => void): void;
        export function incrementCustomUserAttribute(key: string, value: number,
                callback: (error: string, result: string) => void): void;
        export function setFirstName(firstName: string): void;
        export function setLastName(lastName: string): void;
        export function setEmail(email: string): void;
        export function setGender(gender: Genders, callback: (error: string, result: string) => void): void;
        export function setCountry(country: string): void;
        export function setHomeCity(homeCity: string): void;
        export function setPhoneNumber(phoneNumber: string): void;
        export function setAvatarImageUrl(avatarImageUrl: string): void;
        export function setDateOfBirth(year: number, month: number, day: number): void;
        // export function setPushNotificationSubscriptionType
        // export function setEmailNotificationSubscriptionType
        // export function addToCustomUserAttributeArray
        // export function removeFromCustomUserAttributeArray
        // export function unsetCustomUserAttribute
        // export function setTwitterData
        // export function setFacebookData
        // export function launchNewsFeed
        // export function requestFeedRefresh
        // export function getCardCountForCategories
        // export function getUnreadCardCountForCategories
        // export function launchFeedback
        export function requestImmediateDataFlush(): void;
        // export function wipeData
        export function disableSDK(): void;
        export function enableSDK(): void;
    }

    export = ReactAppboy
}
