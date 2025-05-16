<template>
    <q-page class="q-pa-md">
        <div class="text-h4 text-center q-mb-lg">{{ noteTitle || 'Untitled Note' }}</div>

        <q-input 
            v-model="noteTitle"
            label="Note Title" 
            data-testid="note-title-input"
            clearable
            outlined 
            class="q-mb-md q-w-full q-max-w-md"
            :error="!noteTitle && showError"
            error-message="Title is required"
        />
        
        <q-select 
            v-model="selectedCategories" 
            :options="categoryOptions" 
            data-testid="category-options-select"
            label="Categories" 
            multiple 
            emit-value 
            map-options 
            outlined 
        />

        <q-input 
            v-model="noteContent" 
            label="Note Content" 
            data-testid="note-content-input"
            type="textarea"
            outlined
            rows="5"
            class="q-mt-md"
            :error="!noteContent && showError"
            error-message="Content is required"
        />

        <div class="q-mt-md">
            <div class="text-h6 q-mt-lg">Priority Rating:</div>
            <q-rating 
                v-model="priority" 
                max="5" 
                icon="priority_high" 
                color="red" 
                size="2em"
                label="Priority" 
                data-testid="priority-rating"
                filled
                class="shadow-2 q-pa-sm"
            />
        </div>

        <div class="q-mt-md q-gutter-md flex justify-around">
            <q-btn 
                label="Save Note" 
                @click="saveNote" 
                data-testid="save-note-btn"
                color="primary" 
                class="q-mb-md" 
            />
            
            <q-btn 
                label="Delete Note" 
                @click="deleteNote"
                data-testid="delete-note-btn" 
                color="negative" 
                class="q-mb-md" 
            />

            <q-btn 
                label="Read Note Content" 
                @click="readNote"
                data-testid="read-note-btn"
                color="secondary"
                class="q-mb-md"
            />
        </div>

    </q-page>
</template>
  
<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { Note, Category } from '../components/models';
    import { Notify } from 'quasar';
    import { TextToSpeech } from '@capacitor-community/text-to-speech';

  
    const noteTitle = ref('');
    const noteContent = ref(''); 
    const selectedCategories = ref<number[]>([]);
    const categoryOptions = ref<{ label: string, value: number }[]>([]);
    const priority = ref(3)
  
    const router = useRouter();
    const route = useRoute();
    const noteId = route.params.id as string | undefined;
  
    const temporaryNote = ref<Note | null>(null);
    const showError = ref(false);

    onMounted(() => {
        // Fetch all categories
        const categories = Category.all();
        categoryOptions.value = categories
            .filter(c => c.id !== undefined)
            .map(c => ({
                label: c.name,
                value: c.id as number,
        }));

    // If editing, fetch the note details
    if (noteId) {
        const existingNote = Note.get(Number(noteId));
        noteTitle.value = existingNote.title;
        noteContent.value = existingNote.content;
        selectedCategories.value = existingNote.categories;
        priority.value = existingNote.priority || 3;
        }
    });

    // Save or update the note
    const saveNote = async () => {
        if (!noteTitle.value || !noteContent.value) {
            showError.value = true;
            Notify.create({
            message: "Please fill in all required fields.",
            color: "negative",
            position: "top",
            icon: "error_outline",
            timeout: 2000,
            });
            return;
        }

        showError.value = false;


        if (noteId) {
            // Update the existing note
            const existingNote = Note.get(Number(noteId));
            temporaryNote.value = existingNote.clone();
            existingNote.title = noteTitle.value;
            existingNote.content = noteContent.value;
            existingNote.categories = selectedCategories.value;
            existingNote.priority = priority.value
            console.log('Updating note', existingNote);

            Notify.create({
                message: 'Note updated successfully!',
                color: 'positive',
                position: 'top',
                icon: 'check_circle_outline',
                timeout: 5000,
                actions: [
                    {
                        label: 'Undo',
                        color: 'white',
                        handler: () => {
                            if (temporaryNote.value) {
                                existingNote.title = temporaryNote.value.title;
                                existingNote.content = temporaryNote.value.content;
                                existingNote.categories = temporaryNote.value.categories;
                                existingNote.priority = temporaryNote.value.priority;
                                void router.push(`/note/${noteId}`)
                            }
                        }
                    }
                ]
            });
        } else {
            // Create a new note
            const newNote = Note.create({
                title: noteTitle.value,
                content: noteContent.value,
                categories: selectedCategories.value,
                priority: priority.value,
            });
            temporaryNote.value = newNote;
            console.log('Creating new note', newNote);

            Notify.create({
                message: 'New note created!',
                color: 'positive',
                position: 'top',
                icon: 'check_circle_outline',
                timeout: 2000,
                actions: [
                    {
                        label: "Undo",
                        color: "white",
                        handler: () => {
                            if (temporaryNote.value) {
                            temporaryNote.value.delete();
                            console.log("Undo new note creation", temporaryNote.value);
                            temporaryNote.value = null;
                            }
                        },
                    },
            ],
            })
        }

        // Redirect after saving
        try {
            await router.push('/notes'); 
        } catch (error) {
            console.error("Failed to redirect:", error)
        }

    };

    // Delete the note
    const deleteNote = async () => {
        if (noteId) {
            const existingNote = Note.get(Number(noteId));
            temporaryNote.value = existingNote.clone();
            existingNote.delete();
            console.log('Deleting note', existingNote);
            Notify.create({
                message: 'Note deleted successfully!',
                color: 'negative',
                position: 'top',
                icon: 'delete_outline',
                timeout: 5000,
                actions: [
                    {
                        label: 'Undo',
                        icon: 'undo',
                        handler: () => {
                            if (temporaryNote.value) {
                                // Restore the note
                                const restoredNote = Note.create({
                                    title: temporaryNote.value.title,
                                    content: temporaryNote.value.content,
                                    categories: temporaryNote.value.categories,
                                    priority: temporaryNote.value.priority,
                                });
                                console.log('Restoring note', restoredNote);
                                void router.push(`/note/${restoredNote.id}`);
                                Notify.create({
                                    message: 'Action undone! Note restored.',
                                    color: 'positive',
                                    position: 'top',
                                    timeout: 2000,
                                });
                            }
                        }
                    }
                ]
            });
        }

        // Redirect after deleting
        try {
            await router.push('/notes');
        } catch (error) {
            console.error("Failed to redirect:", error)
        }
        
    };

    // Text-to-Speech Functionality
    const readNote = async () => {
        if (!noteContent.value) {
            Notify.create({
                message: 'No content to read.',
                color: 'negative',
                position: 'top',
                icon: 'error_outline',
                timeout: 2000,
            });
            return;
        }

        try {
            window.speechSynthesis.cancel();
            await TextToSpeech.speak({
                text: noteContent.value,
                lang: 'en-US',
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                category: 'ambient',
                queueStrategy: 1
            });
            Notify.create({
                message: 'Reading note aloud...',
                color: 'positive',
                position: 'top',
                icon: 'volume_up',
                timeout: 2000,
            });
        } catch (error) {
            console.error('Error using Text-to-Speech:', error);
            Notify.create({
                message: 'Failed to read the note.',
                color: 'negative',
                position: 'top',
                icon: 'error_outline',
                timeout: 2000,
            });
        }
    };
</script>
  