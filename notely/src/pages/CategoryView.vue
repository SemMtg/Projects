<template>
    <q-page class="q-pa-md">
        <div class="text-h4 text-center q-mb-lg">{{ categoryName || 'Untitled Category' }}</div>

        <q-input
            v-model="categoryName"
            label="Category Name"
            clearable
            outlined
            class="q-mb-md q-w-full q-max-w-md"
        />

        <div class="text-h6 q-mt-lg">Notes with this category:</div>
        <q-list bordered class="rounded q-pa-md shadow-2">
            <q-item
                v-for="note in notesInCategory"
                :key="note.id ?? -1"
                clickable
                :to="`/note/${note.id}`"
                class="q-mb-sm rounded q-hoverable q-pa-md shadow-1 bg-grey-1"
            >
                <q-item-section class="text-bold">{{ note.title }}</q-item-section>

            </q-item>
            <div
                v-if="notesInCategory.length === 0" class="text-h6 text-center">
                No notes found
            </div>
        </q-list>

        <div class="q-mt-md q-gutter-md flex justify-around">
            <q-btn 
                label="Save Category" 
                color="primary"
                @click="saveCategory" 
                class="q-mb-md"
            />

            <q-btn 
                label="Delete Category" 
                color="negative" 
                @click="deleteCategory" 
                class="q-mb-md" 
            />
        </div>
    </q-page>
</template>
  
<script setup lang="ts">
import { ref, onMounted } from 'vue';  
import { useRoute, useRouter } from 'vue-router';
import { Category, Note } from 'src/components/models'
import { Notify } from 'quasar'

const route = useRoute();
const router = useRouter();

// Get the category ID from the URL
const categoryId = Number(route.params.id);

const categoryName = ref('');
const notesInCategory = ref<Note[]>([]);

// Fetch the category and notes dynamically
const loadCategoryData = () => {
    try {
        // Fetch the category by its ID
        const category = Category.get(categoryId);
        categoryName.value = category ? category.name : 'Unknown Category';

        // Fetch the notes that belong to this category
        const allNotes = Note.all();
        notesInCategory.value = allNotes.filter(note => note.categories.includes(categoryId));
    } catch (error) {
        console.error('Error fetching category or notes:', error);
    }
};

// Load category data when component is mounted
onMounted(() => {
    void loadCategoryData();
});

const saveCategory = async () => {
    try {
        const category = Category.get(categoryId);
        if (category) {
            // Update the category name
            category.name = categoryName.value;
            console.log('Category name updated:', categoryId, categoryName.value);

            loadCategoryData();
            try {
                await router.push({ name: 'category' })
            } catch (error){
                console.error("Failed to redirect:", error)
            }
            Notify.create({
                message: 'Category succesfully saved!',
                color: 'positive',
                position: 'top',
                icon: 'check_circle_outline',
                timeout: 2000
            })
        }
    } catch (error) {
        console.error('Error saving category name:', error);
        Notify.create({
            message: 'Failed to add category. Please try again.',
            color: 'negative',
            position: 'top',
            timeout: 2000
        });
    }
};

// Delete category and redirect
const deleteCategory = async () => {
    try {
        const category = Category.get(categoryId);
        if (category) {
            // Store a copy of the category and its notes for undo functionality
            const deletedCategory = category.clone();
            const affectedNotes = Note.all().filter(note => note.categories.includes(categoryId));

            // Delete the category
            category.delete();
            console.log('Category deleted:', categoryId);

            // Remove the category ID from all notes
            const allNotes = Note.all();
            allNotes.forEach(note => {
                // Remove this category ID from the note's categories
                note.categories = note.categories.filter(id => id !== categoryId);
            });

            // Refresh the data to ensure the UI reflects the changes
            categoryName.value = '';
            notesInCategory.value = [];
            
            Notify.create({
                message: 'Category deleted successfully.',
                color: 'negative',
                position: 'top',
                timeout: 4000,
                icon: 'delete_outline',
                actions: [
                    {
                        label: 'Undo',
                        color: 'white',
                        handler: () => {
                            // Restore the deleted category
                            Category.create(deletedCategory);

                            // Reassign the category ID to the affected notes
                            affectedNotes.forEach(note => {
                                if (!note.categories.includes(categoryId)) {
                                    note.categories.push(categoryId);
                                }
                            });

                            // Refresh the data
                            loadCategoryData();

                            Notify.create({
                                message: 'Action undone! Category restored.',
                                color: 'positive',
                                position: 'top',
                                timeout: 2000,
                            });
                        },
                    },
                ],
            });
            // Redirect back to the categories list
            try {
                await router.push({ name: 'category' })
            } catch (error){
                console.error("Failed to redirect:", error)
            }
        }
    } catch (error) {
        console.error('Error deleting category:', error);
    }
};
</script>
  