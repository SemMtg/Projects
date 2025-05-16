<template>
    <q-page class="q-pa-md">
        <div class="text-h4 text-center q-mb-lg">Manage Your Notes</div>

        <q-input 
            v-model="searchTerm" 
            label="Search Notes" 
            clearable 
            outlined 
            class="q-mb-md q-w-full q-max-w-md"
        />

        <q-list bordered separator class="rounded q-pa-md shadow-2">
            <q-btn 
                icon="add"
                data-testid="create-new-note-btn"
                label="Create new note"
                @click="createNewNote" 
                color="secondary" 
                class="q-mr-md q-mb-sm text-bold shadow-2"
                size="md"
            />
            <q-item 
                v-for="note in filteredNotes.slice().reverse()" 
                :key="note.id  ?? note.title"
                clickable
                @click="editNote(note.id ?? 0);"
                class="q-mb-sm rounded q-hoverable q-pa-md shadow-1 bg-grey-1"
            >
            <q-item-section class="q-pa-sm">
                <div class="row text-subtitle1 text-bold justify-between" >
                    {{ note.title }}
                    <q-rating :model-value="note.priority" size="2em" max="5" icon="priority_high" color="red" readonly />
                </div>
            </q-item-section>
                <q-tooltip :delay="400" anchor="bottom middle"  transition-show="scale" transition-hide="scale" class="bg-accent text-body2">
                    {{ note.content }}
                </q-tooltip>
            </q-item>

            <div 
                v-if="filteredNotes.length === 0" class="text-h6 q-mt-md text-center">
                No notes found.
            </div>
        </q-list>
    </q-page>
</template>
  
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Note } from '../components/models'

const searchTerm = ref('');
const notes = ref<Note[]>([]);
const router = useRouter();

// Fetch notes from the database or models
const loadNotes = () => {
    try {
        notes.value = Note.all();
    } catch (error) {
        console.error('Error loading notes:', error);
    }
};

// Filter notes based on the search term
const filteredNotes = computed(() => {
    return notes.value.filter(note => 
        note.title.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
});

    // Function to navigate to the new note editor
const createNewNote = async () => {
    try {
        await router.push({ name: 'note-new' });
    } catch (error) {
        console.error('Navigation error:', error);
    }
};

const editNote = async (noteId: number) => {
    try {
        await router.push({ name: 'note-edit', params: { id: noteId } });
    } catch (error) {
        console.error('Navigation error:', error);
    }
};

// Load notes when component is mounted
onMounted(() => {
    try {
        loadNotes();
    } catch (error) {
        console.error("Failed to load notes:", error)
    }
});
</script>
  