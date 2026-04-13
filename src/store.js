import Vue from 'vue';

export const store = Vue.observable({
    tenant: {
        id: null,
        name: 'Panel',
        logo_url: null,
    },
    userProfile: {
        id: null,
        full_name: '',
        avatar_url: null,
        role: ''
    }
});

export const mutations = {
    setTenant(tenantData) {
        store.tenant = { ...store.tenant, ...tenantData };
        
        // Dinamik Document Title & Favicon Güncellemesi
        if (store.tenant.name) {
            document.title = `${store.tenant.name} | Satış & Tahsilat Takip`;
        }
        
        if (store.tenant.logo_url) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = store.tenant.logo_url;
        }
    },
    setUserProfile(profileData) {
        store.userProfile = { ...store.userProfile, ...profileData };
    }
};
