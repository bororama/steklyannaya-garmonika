import './assets/main.css'
import  ProfilePage from './components/ProfilePage.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createApp } from 'vue'
import App from './App.vue'

declare global {
    var id : string;
    var username : string;
};

const routes = [
	{path: '/', component : App},
	{path: '/profile-page', component : ProfilePage},
];

const router = createRouter(
	{
		history: createWebHashHistory(),
		routes : routes,
	}
);

const app = createApp(App);

app.use(router);
app.mount('#app');
