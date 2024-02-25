import './assets/main.css';
import { createRouter, createWebHashHistory } from 'vue-router';
import { createApp } from 'vue';
import App from './App.vue';
import Home from './components/Home.vue';
import NotFound from './components/NotFound.vue';
import GUI from './components/GUI/components/GUI.vue';
import PublicChats from './components/GUI/components/PublicChats.vue';
import PongInstructions from './components/GUI/components/PongInstructions.vue';
import PearlCloseUp from './components/GUI/components/PearlCloseUp.vue';
import InventoryPopupable from './components/GUI/components/InventoryPopupable.vue';
import AdminPage from './components/GUI/components/AdminPage.vue';
import Leaderboard from './components/GUI/components/Leaderboard.vue';
import ATalkWithGod from './components/GUI/components/ATalkWithGod.vue';
import RegisterPage from './components/GUI/components/RegisterPage.vue';
import PersonalProfile from './components/GUI/components/PersonalProfile.vue';
import ProfileDisplay from './components/GUI/components/ProfileDisplay.vue';
import RoutablePong from './components/GUI/components/RoutablePong.vue';
import Shop from './components/GUI/components/Shop.vue';
import LoadingWelcome from './components/GUI/components/LoadingWelcome.vue';
import TempleOfferings from './components/GUI/components/TempleOfferings.vue';
import { guard_against_not_logged } from './navigation_guards/is_logged.ts';
import { guard_against_non_admins } from './navigation_guards/is_admin.ts';


declare global {
  var logToken: string
  var id: string
  var username: string;
  var has2FA : boolean
  var my_data : any
  var is_admin : boolean;
  var backend : string;
  var metaSocket : any;
}

const routes = [
	{
		path: '/',
		name: 'GUI',
		component: GUI,
		children : [{
			path: 'help',
			name: 'help',
			component : PongInstructions,
            beforeEnter: [guard_against_not_logged]
		  },
          {
            path: 'profile_page',
            name: 'MyProfile',
            component: PersonalProfile,
            beforeEnter: [guard_against_not_logged]
          },
          {
            path: 'profile_view',
            name: 'ProfileView',
            component: ProfileDisplay,
            beforeEnter: [guard_against_not_logged]
          },
          {
            path: 'admin_page',
            name: 'AdminPage',
            component: AdminPage,
            beforeEnter: [guard_against_not_logged, guard_against_non_admins]
          },
          {
            path: 'leaderboard',
            name: 'Leaderboard',
            component: Leaderboard,
            beforeEnter: [guard_against_not_logged]
          },
          {
            path: '/offerings',
            name: 'Offerings',
            component: TempleOfferings,
            beforeEnter: [guard_against_not_logged]
          },
          {
            path: 'pong_match',
            name: 'RoutablePong',
            component: RoutablePong,
            beforeEnter: [guard_against_not_logged]
          },
          {
            path: 'inventory',
            name: 'inventory',
            component: InventoryPopupable,
            beforeEnter: [guard_against_not_logged],
            children: [{ 
                path: 'pearl_close_up',
                name: 'PearlCloseUpInventory',
                component: PearlCloseUp
            },
            { 
                path: 'profile_view',
                name: 'ProfilePageInventory',
                component: ProfileDisplay
            },
          ]},
          {
            path: '/shop',
            name: 'CurroShop',
            component: Shop
          }
          ],
	},
    {
      path: '/register',
      name: 'RegisterPage',
      component: RegisterPage
    },
	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		component: NotFound,
	},
	{
		path: '/bad_request',
		name: 'BadRequest',
		component: NotFound,
	},
    {
      path: '/securizing',
      name: 'Securizer',
      component: LoadingWelcome
    }
];

const router = createRouter(
	{
		history: createWebHashHistory(),
		routes : routes,
	}
);

globalThis.has2FA = false;
globalThis.backend = 'http://' + process.env.HOST + ':3000';

const app = createApp(App);

app.use(router);
app.mount('#app');
