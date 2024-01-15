import './assets/main.css';
import { createRouter, createWebHashHistory } from 'vue-router';
import { createApp } from 'vue';
import App from './App.vue';
import ProfilePage from './components/ProfilePage.vue';
import Home from './components/Home.vue';
import NotFound from './components/NotFound.vue';
import GUI from './components/GUI/components/GUI.vue';


declare global {
  var logToken: string
  var id: string
  var username: string;
  var has2FA : boolean
  var my_data : any
}

const routes = [
	{
		path: '/',
		name: 'GUI',
		component: GUI,
	},
	{
		path: '/home/',
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

globalThis.has2FA = false


const app = createApp(App);

app.use(router);
app.mount('#app');
