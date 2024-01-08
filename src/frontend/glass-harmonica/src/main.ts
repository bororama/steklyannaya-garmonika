import './assets/main.css';
import { createRouter, createWebHashHistory } from 'vue-router';
import { createApp } from 'vue';
import App from './App.vue';
import ProfilePage from './components/ProfilePage.vue';
import Home from './components/Home.vue';
import NotFound from './components/NotFound.vue'


declare global {
    var id : string;
    var username : string;
};

const routes = [
	{
		path: '/',
		name: 'Home',
		component : Home,
		children : [{
			path: '/profile/:userId',
			name: 'profile',
			component : ProfilePage
		}],
	},
	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		component: NotFound,
	}
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
