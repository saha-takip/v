import { createClient } from '@supabase/supabase-js'
import { Notification } from 'element-ui'

const supabaseUrl = process.env.VUE_APP_SUPABASE_URL
const supabaseAnonKey = process.env.VUE_APP_SUPABASE_ANON_KEY

const customFetch = async (url, options) => {
  if (!navigator.onLine) {
    Notification.error({
      title: 'Bağlantı Hatası',
      message: 'İnternet bağlantınız koptu. İstek gönderilemiyor.',
      position: 'top-right'
    });
    return Promise.reject(new Error('Sistem çevrimdışı. Lütfen internet bağlantınızı kontrol edin.'));
  }
  return fetch(url, options);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch
  }
})
