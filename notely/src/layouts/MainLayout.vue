<template>
  <q-layout view="lHh Lpr lFf">
    <q-img
      src="background.jpg"
      class="fit absolute"
    />
    <q-header elevated>
      <q-toolbar class="justify-center">
        <q-toolbar-title class="text-h4 q-ml-sm text-accent text-bold">
          Notely
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view/>
    </q-page-container>

    <q-footer elevated>
        <q-tabs>
          <q-route-tab 
            name="Menu" 
            icon="menu" 
            label="Menu" 
            to="/menu"
          />
          <q-route-tab 
            name="Months" 
            icon="description" 
            label="Notes"
            to="/notes"
          />
          <q-route-tab 
            name="Categories" 
            icon="category" 
            label="Categories" 
            to="/category" />
        </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">


</script>
