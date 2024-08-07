import AsyncStorage from '@react-native-async-storage/async-storage';

// export const authenticatedFetch: (url: string, options: any) => Promise<Response> = async (url, options = {}) => {
//     const token = await AsyncStorage.getItem('token');
//     console.log(token);
//     options.headers = {
//         ...options.headers,
//         Authorization: token ? `Token ${token}` : ''
//     };
//     return await fetch(`http://${ServerInfo.ip}:${ServerInfo.port}${url}`, options);
// }

export async function authenticatedFetch(url: string, options: any = {}): Promise<Response> {
    const token = await AsyncStorage.getItem('token');
    options.headers = {
        ...options.headers,
        Authorization: token ? `Token ${token}` : ''
    };
    return await fetch(url, options);
}