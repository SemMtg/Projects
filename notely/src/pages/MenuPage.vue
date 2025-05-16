<template>
    <q-page class="column items-center justify-evenly q-pa-md">

        <div class="text-h3 text-center q-mb-md text-accent text-bold">Welcome to Notely</div>

        <div class="row items-center justify-evenly q-gutter-md">
            <q-btn 
                :label="`View Notes (${notesCount})`"
                data-testid="view-notes-btn"
                to="/notes"
                color="secondary"
                class="q-px-xl q-py-md text-h6"
            />
            <q-btn 
                :label="`View Categories (${categoriesCount})`" 
                to="/category" 
                color="secondary" 
                class="q-px-xl q-py-md text-h6" 
            />
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted} from 'vue';
import { Note, Category } from 'src/components/models';

const notesCount = ref<number | null>(null);
const categoriesCount = ref<number | null>(null);

const fetchCounts = () => {
    try {
        notesCount.value = Note.all().length;
        categoriesCount.value = Category.all().length;
    } catch (error) {
        console.error('Error fetching counts:', error);
        notesCount.value = 0;
        categoriesCount.value = 0;
    }
};

onMounted( () => {
    try {
        fetchCounts();
    } catch (error) {
        console.error("Failed to fetch counts:", error)
    }
});
</script>
  