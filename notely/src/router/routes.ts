import type { RouteRecordRaw } from 'vue-router';
import NoteList from '../pages/NoteList.vue';
import CategoryList from '../pages/CategoryList.vue';
import MenuPage from '../pages/MenuPage.vue'
import NoteEditor from '../pages/NoteEditor.vue';
import CategoryView from '../pages/CategoryView.vue';


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: { name: 'menu' } },
      { path: 'menu', component: MenuPage, name: 'menu' }, 
      { path: 'notes', component: NoteList, name: 'notes' },
      { path: 'category', component: CategoryList, name: 'category'},
      { path: 'note/:id', component: NoteEditor, name: 'note-edit' },
      { path: 'note/new', component: NoteEditor, name: 'note-new'},
      { path: 'category/:id', component: CategoryView, name: 'category-view'}, 
    ],
      
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
