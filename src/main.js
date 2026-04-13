import Vue from 'vue'
import App from './App.vue'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import VueSweetalert2 from 'vue-sweetalert2'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'
import locale from './locale/tr';
import './filters';
 
import { store, mutations } from './store';

// Global Store Enjeksiyonu
Vue.prototype.$storeState = store;
Vue.prototype.$storeMutations = mutations;

Vue.use(BootstrapVue)
Vue.use(VueSweetalert2)
Vue.use(ElementUI, { locale });

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
