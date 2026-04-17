import Vue from 'vue';

// LocalStorage'dan branding verilerini hemen yükleyelim (Init hızı için)
const getInitialBranding = () => {
    const defaultBranding = {
        id: null,
        name: 'Admin Panel',
        logo_url: null,
        icon_url: null,
    };
    try {
        const saved = localStorage.getItem('last_tenant_branding');
        return saved ? { ...defaultBranding, ...JSON.parse(saved) } : defaultBranding;
    } catch (e) {
        return defaultBranding;
    }
};

export const store = Vue.observable({
    tenant: getInitialBranding(),
    userProfile: {
        id: null,
        full_name: '',
        avatar_url: null,
        role: ''
    }
});

// İlk açılışta title ve favicon'u set edelim
if (store.tenant.name && store.tenant.name !== 'Admin Panel') {
    document.title = `${store.tenant.name} | Satış & Tahsilat Takip`;
}

if (store.tenant.icon_url) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = store.tenant.icon_url;
}

export const mutations = {
    setTenant(tenantData) {
        store.tenant = { ...store.tenant, ...tenantData };

        // Branding bilgilerini her zaman localStorage'da güncel tutalım
        // Bu sayede çıkış yapıldığında veya refresh edildiğinde login ekranında gösterilebilir
        const branding = {
            logo_url: store.tenant.logo_url,
            icon_url: store.tenant.icon_url,
            name: store.tenant.name
        };
        localStorage.setItem('last_tenant_branding', JSON.stringify(branding));

        // Dinamik Document Title & Favicon Güncellemesi
        if (store.tenant.name && store.tenant.name !== 'Admin Panel') {
            document.title = `${store.tenant.name} | Satış & Tahsilat Takip`;
        } else {
            document.title = 'Admin Panel | Satış & Tahsilat Takip';
        }

        if (store.tenant.icon_url) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = store.tenant.icon_url;
        }
    },
    setUserProfile(profileData) {
        store.userProfile = { ...store.userProfile, ...profileData };
    }
};
