<template>
    <q-page class="q-pa-md">

        <div class="text-h4 q-mb-lg text-center">Categories</div>

        <q-list v-if="authenticated" bordered class="rounded q-pa-md shadow-2">

            <q-btn 
                icon="add"
                label="Add Category" 
                color="secondary" 
                @click="addCategory" 
                class="q-mr-md q-mb-sm text-bold shadow-2"
                size="md" 
            />

            <q-item 
                v-for="category in categories.slice().reverse()" 
                :key="category.id ?? category.name"
                clickable
                :to="`/category/${category.id}`"
                class="q-mb-sm rounded q-hoverable q-pa-md shadow-1 bg-grey-1"
            >
                <q-item-section class="text-subtitle1 text-bold q-pa-sm">{{ category.name }}</q-item-section>
            </q-item>

            <div v-if="categories.length === 0" class="text-h6 q-mt-md text-center">
                No categories available.
            </div>

        </q-list>
        <div v-else class="text-h6 q-mt-md text-center">
            Please authenticate using biometrics or pin to access the categories.
        </div>
    </q-page>
</template>
  
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Category } from 'src/components/models';
import { Notify } from 'quasar'
import {
    BiometricAuth,
    AndroidBiometryStrength,
} from '@aparajita/capacitor-biometric-auth';
import type { CheckBiometryResult } from '@aparajita/capacitor-biometric-auth';

const categories = ref<Category[]>([]);
const authenticated = ref(false);

const checkBiometry = async (): Promise<boolean> => {
    try {
        const biometryResult: CheckBiometryResult = await BiometricAuth.checkBiometry();

        if (biometryResult.isAvailable) {
        await BiometricAuth.authenticate({
            reason: 'Please authenticate to access the categories',
            cancelTitle: 'Cancel',
            allowDeviceCredential: true,
            androidTitle: 'Biometric login',
            androidSubtitle: 'Log in using biometric authentication',
            androidConfirmationRequired: false,
            androidBiometryStrength: AndroidBiometryStrength.strong,
        });

        authenticated.value = true;
        return true;
        } else {
        console.warn(
            'Biometry not available:',
            biometryResult.reason || 'No reason provided'
        );
        Notify.create({
            message: 'Biometry not available. Granting access.',
            color: 'warning',
            position: 'top',
            icon: 'info',
        });
        authenticated.value = true; // Grant access if no biometry exists on device (For easy checking purposes ;) )
        return true;
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        Notify.create({
        message: 'Authentication failed or canceled. Granting access.',
        color: 'warning',
        position: 'top',
        icon: 'error',
        });
        authenticated.value = true; // Grant access if authentication fails
        return true;
    }
};

// Load all categories
const loadCategories = () => {
    try {
        const allCategories = Category.all();
        categories.value = Array.isArray(allCategories) ? allCategories : [];
    } catch (error) {
        console.error('Error loading categories:', error);
        categories.value = [];
    }
};

const addCategory = () => {
    try {
        // Create an empty category with a default name
        const newCategory = Category.create({
            name: 'New Category'
        });
        // Add the new category to the list
        categories.value.push(newCategory);

        Notify.create({
            message: 'Category succesfully created!',
            color: 'positive',
            position: 'top',
            icon: 'check_circle_outline',
            timeout: 2000,
            actions: [
                {
                    label: 'Undo',
                    icon: 'undo',
                    handler: () => {
                        const index = categories.value.indexOf(newCategory);
                        if (index > -1) {
                            categories.value.splice(index, 1);
                        }
                        newCategory.delete()
                    }
                }
            ]
        })
    } catch (error) {
        console.error('Error adding category:', error);
        Notify.create({
            message: 'Failed to add category. Please try again.',
            color: 'negative',
            position: 'top',
            timeout: 2000
        });
    }
};

onMounted(async () => {
    const isAuthenticated = await checkBiometry();
    if (isAuthenticated) {
        loadCategories();
    } else {
        console.warn('User failed to authenticate.');
    }
});
</script>
  