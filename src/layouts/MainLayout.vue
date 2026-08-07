<template>
  <q-layout view="hHh Lpr fFf" class="main-layout-wrapper bg-solid-dark">

    <audio ref="audioPlayer" :src="currentSongSrc" loop></audio>

    <q-header class="bg-solid-panel text-white header-clean-border">
      <q-toolbar class="full-height q-px-lg row items-center no-wrap">

        <q-btn flat round dense icon="menu" class="q-mr-md header-icon-btn" @click="toggleDrawer" />

        <q-toolbar-title class="logo-wrapper">
          <div class="column justify-center full-height">
            <div class="text-h5 logo-text" style="line-height: 1;">
              <span>E</span> • <span>M</span> • <span>R</span>
            </div>
            <div class="logo-subtext">electronic medical record</div>
          </div>
        </q-toolbar-title>

        <q-space />

        <div class="q-mr-md">
          <q-btn-toggle
            v-model="currentLang"
            toggle-color="primary"
            color="blue-grey-9"
            text-color="grey-5"
            size="sm"
            rounded
            unelevated
            :options="[
              {label: 'TH', value: 'th'},
              {label: 'EN', value: 'en'}
            ]"
            class="border-clean"
          />
        </div>

        <div class="music-pill-container row items-center justify-center q-px-sm rounded-borders">
          <q-btn flat round dense size="sm" icon="skip_next" @click="changeSong" class="header-icon-btn">
            <q-tooltip class="bg-grey-9" :offset="[0, 5]">Next Song</q-tooltip>
          </q-btn>
          <div class="vertical-separator q-mx-sm"></div>
          <q-btn
            flat round dense size="sm" icon="music_note"
            @click="togglePlayback"
            :class="['header-icon-btn', { 'music-active-animation': isPlaying }]"
          >
            <q-tooltip class="bg-grey-9" :offset="[0, 5]">{{ isPlaying ? 'Pause' : 'Play Music' }}</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      overlay
      :width="isDrawerCollapsed ? 80 : 280"
      :breakpoint="768"
      class="bg-solid-panel drawer-grey-glow"
    >
      <div class="column full-height">

        <q-scroll-area
          class="col"
          :thumb-style="{ width: '4px', opacity: 0.5, right: '2px', backgroundColor: '#64748b' }"
        >
          <q-list class="q-pa-md">

            <div v-for="(section, index) in menuSections" :key="index">

              <q-item-label
                v-if="section.label && !isDrawerCollapsed && section.items.length > 0"
                header
                class="section-label"
              >
                {{ section.label }}
              </q-item-label>

              <div v-for="item in section.items" :key="item.path">

                <q-item
                  v-if="!item.children"
                  clickable
                  v-ripple
                  :to="item.path"
                  :class="['modern-menu-item', item.isLogout ? 'logout-item' : '']"
                  active-class="modern-active"
                  @click="item.isLogout ? handleLogout() : null"
                >
                  <q-item-section avatar>
                    <q-icon :name="item.icon" :color="item.iconColor || ''"/>
                  </q-item-section>
                  <q-item-section v-if="!isDrawerCollapsed">{{ t(item.labelKey) }}</q-item-section>

                  <q-tooltip
                    v-if="isDrawerCollapsed"
                    anchor="center right"
                    self="center left"
                    :offset="[10, 0]"
                    :class="item.isLogout ? 'bg-red-9' : 'bg-grey-9'"
                  >
                    {{ t(item.labelKey) }}
                  </q-tooltip>
                </q-item>

                <q-expansion-item
                  v-else
                  :icon="item.icon"
                  :label="!isDrawerCollapsed ? t(item.labelKey) : ''"
                  group="clinical"
                  header-class="modern-expansion-header"
                  expand-icon-class="text-grey-5"
                  :default-opened="currentUser?.role === 'Nurse'"
                  v-show="!isDrawerCollapsed"
                >
                  <div class="q-pl-lg q-pt-xs">
                    <div class="submenu-line-container">
                      <q-item
                        v-for="sub in item.children"
                        :key="sub.path"
                        clickable
                        v-ripple
                        :to="sub.path"
                        class="modern-submenu-item"
                        active-class="submenu-active"
                      >
                        <q-item-section>
                          <div class="row items-center"><div class="dot"></div> {{ t(sub.labelKey) }}</div>
                        </q-item-section>
                      </q-item>
                    </div>
                  </div>
                </q-expansion-item>

                <q-item
                   v-if="item.children && isDrawerCollapsed"
                   clickable
                   v-ripple
                   :to="item.children[0].path"
                   class="modern-menu-item"
                   active-class="modern-active"
                >
                   <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
                   <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" class="bg-grey-9">{{ t(item.labelKey) }}</q-tooltip>
                </q-item>

              </div>

              <q-separator v-if="index < menuSections.length - 1 && section.items.length > 0" class="q-my-md separator-dark" />

            </div>

          </q-list>
        </q-scroll-area>

        <div
          class="user-profile-mini q-pa-md border-top-dark cursor-pointer profile-hover"
          v-if="currentUser"
          @click="isProfileOpen = true"
        >
            <div class="row items-center no-wrap">

                <q-avatar size="42px" class="shadow-3 relative-position" :color="getRoleColor(currentUser.role)" text-color="white">
                    <img v-if="currentUser.avatar_url" :src="currentUser.avatar_url">
                    <template v-else>
                        <q-icon v-if="currentUser.role === 'Doctor'" name="medical_services" size="24px" />
                        <q-icon v-else-if="currentUser.role === 'Nurse'" name="local_hospital" size="24px" />
                        <q-icon v-else-if="currentUser.role === 'Pharmacist'" name="vaccines" size="24px" />
                        <q-icon v-else-if="currentUser.role === 'Admin'" name="security" size="24px" />
                        <span v-else class="text-weight-bold text-h6">{{ (currentUser.firstName || currentUser.first_name || 'U').charAt(0) }}</span>
                    </template>
                    <div class="online-status-dot"></div>
                </q-avatar>

                <div class="q-ml-md overflow-hidden col" v-if="!isDrawerCollapsed">

                    <div class="text-subtitle2 text-white ellipsis text-weight-bold" style="line-height: 1.2;">
                        {{ currentUser.prefix }} {{ currentUser.firstName || currentUser.first_name }} {{ currentUser.lastName || currentUser.last_name }}
                    </div>

                    <div class="row items-center q-mt-xs">
                        <q-badge
                            :color="getRoleColor(currentUser.role)"
                            class="q-py-xs q-px-sm text-weight-bold shadow-1"
                            rounded
                            style="font-size: 0.65rem;"
                        >
                            <q-icon
                                :name="currentUser.role === 'Admin' ? 'verified_user' : 'badge'"
                                size="10px"
                                class="q-mr-xs"
                            />
                            {{ currentUser.role ? currentUser.role.toUpperCase() : 'USER' }}
                        </q-badge>
                    </div>
                </div>
            </div>
            <q-tooltip v-if="!isDrawerCollapsed" anchor="top middle" self="bottom middle" :offset="[0, 10]" class="bg-primary text-body2">
              คลิกเพื่อดูข้อมูลผู้ใช้
            </q-tooltip>
        </div>

      </div>
    </q-drawer>

    <q-dialog
      v-model="isProfileOpen"
      transition-show="scale"
      transition-hide="scale"
      backdrop-filter="blur(4px)"
    >
      <q-card class="profile-card-solid text-white shadow-24">

        <div class="profile-header-banner relative-position">
           <div class="absolute-top-right q-pa-sm">
              <q-btn icon="close" flat round dense color="white" v-close-popup class="close-btn-shadow"/>
           </div>
        </div>

        <q-card-section class="q-pt-none relative-position profile-avatar-section">
           <div class="row justify-center">
              <div class="relative-position">
                  <q-avatar size="100px" class="shadow-10 avatar-border" :color="getRoleColor(currentUser?.role)" text-color="white">
                     <img v-if="currentUser?.avatar_url" :src="currentUser.avatar_url">
                     <span v-else class="text-h3">{{ (currentUser?.firstName || currentUser?.first_name || 'U').charAt(0) }}</span>
                  </q-avatar>
                  <q-btn
                    round
                    color="primary"
                    icon="camera_alt"
                    size="sm"
                    class="absolute-bottom-right shadow-5 edit-avatar-btn"
                    @click="showEditNotify"
                  />
              </div>
           </div>

           <div class="text-center q-mt-md">
             <div class="text-h6 text-weight-bold letter-spacing-1">
               {{ currentUser?.prefix }} {{ currentUser?.firstName || currentUser?.first_name }} {{ currentUser?.lastName || currentUser?.last_name }}
             </div>
             <q-chip
               :color="getRoleColor(currentUser?.role)"
               text-color="white"
               icon="verified_user"
               class="q-mt-sm text-weight-bold shadow-2"
               size="sm"
             >
               {{ currentUser?.role }} Account
             </q-chip>
           </div>
        </q-card-section>

        <q-card-section class="q-px-lg q-pb-lg">
           <q-form class="q-gutter-y-md">
              <div class="text-subtitle2 text-cyan-3 q-mb-xs">ข้อมูลส่วนตัว (Personal Info)</div>
              <div class="row q-col-gutter-md">
                 <div class="col-12 col-sm-6">
                    <q-input
                      dark outlined dense
                      v-model="currentUser.email"
                      label="อีเมล (Email)"
                      class="premium-input"
                      readonly
                    >
                      <template v-slot:prepend><q-icon name="email" color="grey-5"/></template>
                    </q-input>
                 </div>
                 <div class="col-12 col-sm-6">
                    <q-input
                      dark outlined dense
                      v-model="currentUser.id"
                      label="รหัสพนักงาน (User ID)"
                      class="premium-input"
                      readonly
                    >
                      <template v-slot:prepend><q-icon name="badge" color="grey-5"/></template>
                    </q-input>
                 </div>
              </div>

              <div class="text-subtitle2 text-cyan-3 q-mt-md q-mb-xs">ข้อมูลงาน (Work Info)</div>
              <q-input
                 dark outlined dense
                 label="แผนก/สังกัด (Department)"
                 model-value="แผนกอายุรกรรม (Internal Medicine)"
                 class="premium-input"
                 readonly
              >
                 <template v-slot:prepend><q-icon name="apartment" color="grey-5"/></template>
                 <template v-slot:append><q-icon name="edit" class="cursor-pointer" color="primary" @click="showEditNotify"/></template>
              </q-input>
           </q-form>
        </q-card-section>

        <q-separator dark />

        <q-card-actions align="right" class="q-pa-md bg-dark-soft">
           <q-btn flat label="ปิดหน้าต่าง" color="grey-5" v-close-popup no-caps class="q-px-md"/>
           <q-btn
             unelevated
             label="แก้ไขข้อมูล"
             color="primary"
             icon="edit"
             class="text-weight-bold shadow-2 q-px-md"
             no-caps
             @click="showEditNotify"
           />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

  </q-layout>
</template>

<script>
import { ref, computed, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/store/auth'; // 🔥 ใช้ Store จริง (Pinia)

export default {
  setup() {
    const leftDrawerOpen = ref(true);
    const isDrawerCollapsed = ref(false);
    const isProfileOpen = ref(false); // ควบคุมการเปิด Dialog
    const router = useRouter();
    const $q = useQuasar();

    // 1. เชื่อมต่อ Store
    const authStore = useAuthStore();
    const currentUser = computed(() => authStore.user);

    // 2. Language & Translation
    const currentLang = ref('th');
    const dictionary = {
      home: { th: 'หน้าหลัก', en: 'Home' },
      dashboard: { th: 'ภาพรวมระบบ', en: 'Dashboard' },
      patients: { th: 'ผู้ป่วย', en: 'Patients' },
      nurse: { th: 'พยาบาล (Nurse)', en: 'Nurse' },
      patient_list: { th: 'รายชื่อผู้ป่วย', en: 'Patient Queue' },
      record_data: { th: 'บันทึกข้อมูล', en: 'Record Vitals' },
      doctor: { th: 'แพทย์ (Doctor)', en: 'Doctor' },
      pharmacist: { th: 'เภสัชกร (Pharmacist)', en: 'Pharmacist' },
      master_data: { th: 'จัดการข้อมูลหลัก (Master Data)', en: 'Master Data' },
      user_manage: { th: 'จัดการผู้ใช้ (Admin)', en: 'User Management' },
      settings: { th: 'ตั้งค่า', en: 'Settings' },
      logout: { th: 'ออกจากระบบ', en: 'Logout' }
    };
    const t = (key) => dictionary[key]?.[currentLang.value] || key;

    // 3. Helper Functions
    const getRoleColor = (role) => {
        const r = role ? role.toLowerCase() : '';
        if (r === 'doctor') return 'cyan-6';
        if (r === 'nurse') return 'pink-5';
        if (r === 'pharmacist') return 'purple-5';
        if (r === 'admin') return 'orange-8';
        return 'blue-grey-6';
    };

    const hasAccess = (allowedRoles) => {
        if (!currentUser.value) return false;
        const userRole = currentUser.value.role;

        if (allowedRoles.includes('all')) return true;
        if (userRole === 'Admin') return true;
        return allowedRoles.includes(userRole);
    };

    const handleLogout = () => {
        authStore.logout();
        router.push('/myemr-app/login');
    };

    const showEditNotify = () => {
       $q.notify({
         icon: 'construction',
         message: 'ฟีเจอร์แก้ไขข้อมูลส่วนตัว กำลังพัฒนา...',
         color: 'warning',
         position: 'top',
         timeout: 1500
       });
    };

    // 4. Menu Configuration (Dynamic)
    const menuSections = computed(() => {
        if (!currentUser.value) return [];

        return [
            {
                label: 'GENERAL',
                items: [
                    { labelKey: 'home', icon: 'grid_view', path: '/myemr-app/emr-home', roles: ['all'] },
                    { labelKey: 'dashboard', icon: 'pie_chart_outline', path: '/dashboard', roles: ['all'] },
                    { labelKey: 'patients', icon: 'group', path: '/patient-list', roles: ['all'] },
                ].filter(i => hasAccess(i.roles))
            },
            {
                label: 'CLINICAL SERVICES',
                items: [
                    {
                        labelKey: 'nurse', icon: 'medical_services', roles: ['Nurse'],
                        children: [{ labelKey: 'patient_list', path: '/nurse/patient-list' }, { labelKey: 'record_data', path: '/add-procedure' }]
                    },
                    { labelKey: 'doctor', icon: 'local_hospital', path: '/procedures-list', roles: ['Doctor'] },
                    { labelKey: 'pharmacist', icon: 'vaccines', path: '/medicine-list', roles: ['Pharmacist'] }
                ].filter(i => hasAccess(i.roles))
            },
            {
                label: 'SYSTEM',
                items: [
                    { labelKey: 'master_data', icon: 'folder_shared', iconColor: 'cyan-4', path: '/admin/master-data', roles: ['Admin', 'Doctor', 'Pharmacist'] },
                    { labelKey: 'user_manage', icon: 'admin_panel_settings', iconColor: 'orange-4', path: '/admin/users', roles: ['Admin'] },
                    { labelKey: 'settings', icon: 'tune', path: '/settings', roles: ['all'] },
                    { labelKey: 'logout', icon: 'power_settings_new', path: '#', roles: ['all'], isLogout: true },
                ].filter(i => hasAccess(i.roles))
            }
        ];
    });

    // 5. Audio Player Logic
    const audioPlayer = ref(null);
    const isPlaying = ref(false);
    const songList = ref(['/music/mixkit-beautiful-dream-493.mp3', '/music/Marcelo Nami - Lágrima.mp3']);
    const currentSongIndex = ref(0);
    const currentSongSrc = computed(() => songList.value[currentSongIndex.value]);

    const togglePlayback = async () => {
      if (!audioPlayer.value) return;
      if (isPlaying.value) { audioPlayer.value.pause(); }
      else { try { await audioPlayer.value.play(); } catch (error) { } }
      isPlaying.value = !isPlaying.value;
    };

    const changeSong = async () => {
      currentSongIndex.value = (currentSongIndex.value + 1) % songList.value.length;
      await nextTick();
      if (audioPlayer.value) {
        audioPlayer.value.load();
        if (isPlaying.value) { try { await audioPlayer.value.play(); } catch(e) { isPlaying.value = false; } }
      }
    };

    const toggleDrawer = () => { leftDrawerOpen.value = !leftDrawerOpen.value; };

    return {
      leftDrawerOpen,
      isDrawerCollapsed,
      toggleDrawer,
      audioPlayer,
      isPlaying,
      togglePlayback,
      changeSong,
      currentSongSrc,
      currentUser,
      currentLang,
      t,
      menuSections,
      handleLogout,
      getRoleColor,
      isProfileOpen,
      showEditNotify
    };
  },
};
</script>

<style scoped lang="scss">
/* --- Main Layout Styles --- */
:root {
  --primary-color: #00e5ff;
  --secondary-color: #94a3b8;
  --solid-bg-dark: #0f172a;
  --solid-panel-color: #1e293b;
  --menu-active-bg: rgba(0, 229, 255, 0.1);
}

.bg-solid-dark { background-color: var(--solid-bg-dark); }
.bg-solid-panel { background-color: var(--solid-panel-color) !important; }

/* HEADER */
.q-header { height: 60px; }
.header-clean-border { border-bottom: 1px solid rgba(255, 255, 255, 0.08); box-shadow: none !important; }

/* DRAWER */
.drawer-grey-glow {
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 5px 0 15px rgba(100, 100, 100, 0.2);
}

/* Lang Switch Border */
.border-clean { border: 1px solid rgba(255,255,255,0.1); }

/* Music Pill */
.music-pill-container {
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.05);
  height: 36px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vertical-separator { width: 1px; height: 16px; background-color: rgba(255,255,255,0.1); }

/* Logo */
.logo-wrapper { height: 100%; display: flex; align-items: center; }
.logo-text { font-weight: 700; letter-spacing: 0.15em; color: var(--primary-color); line-height: 1; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); }
.logo-subtext { font-size: 0.5em; margin-top: -0.2em; letter-spacing: 0.01em; color: var(--secondary-color); }

/* Menu Items */
.section-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 1px; color: #64748b; padding-left: 16px; margin-bottom: 8px; margin-top: 8px; }
.modern-menu-item {
  color: #94a3b8; border-radius: 8px; margin-bottom: 2px; font-weight: 500; transition: all 0.3s;
  &:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
  .q-icon { font-size: 1.4rem; transition: color 0.3s; }
}
.modern-active { background: var(--menu-active-bg) !important; color: var(--primary-color) !important; border-left: 3px solid var(--primary-color); }

/* Misc */
.header-icon-btn { color: var(--secondary-color); transition: all 0.3s; &:hover { color: #fff; } }
.modern-expansion-header { border-radius: 8px; color: var(--secondary-color); font-weight: 500; &:hover { color: #fff; background: rgba(255, 255, 255, 0.05); } }
.submenu-line-container { border-left: 1px solid rgba(255,255,255,0.1); padding-left: 4px; }
.modern-submenu-item {
  border-radius: 8px; color: var(--secondary-color); font-size: 0.9rem; margin-bottom: 2px;
  .dot { width: 6px; height: 6px; background: #475569; border-radius: 50%; margin-right: 12px; }
  &:hover { color: #fff; background: rgba(255,255,255,0.03); .dot { background: #fff; } }
}
.submenu-active { color: var(--primary-color) !important; background: var(--menu-active-bg); font-weight: 600; .dot { background: var(--primary-color); } }
.logout-item { color: #ef4444; &:hover { background: rgba(239, 68, 68, 0.1); color: #f87171; } }
.border-top-dark { border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); }
.separator-dark { background: rgba(255,255,255,0.1); }

/* Animation */
@keyframes pulse-glow { 0% { color: var(--primary-color); } 50% { color: #fff; } 100% { color: var(--primary-color); } }
.music-active-animation { color: var(--primary-color) !important; animation: pulse-glow 2s infinite; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* --- Sidebar Profile Styles --- */
.user-profile-mini {
  background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
  transition: background 0.3s;
}
.profile-hover:hover {
  background: rgba(255,255,255,0.05);
}
.online-status-dot {
  width: 10px;
  height: 10px;
  background-color: #2e7d32;
  border: 2px solid var(--solid-panel-color);
  border-radius: 50%;
  position: absolute;
  bottom: 0;
  right: 0;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
}

/* --- Premium Profile Card Styles --- */
.profile-card-solid {
  background-color: #1e293b !important;
  width: 500px;
  max-width: 90vw;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}
.profile-header-banner {
  height: 120px;
  background: linear-gradient(135deg, #0f172a 0%, #1e40af 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.profile-avatar-section {
  margin-top: -50px;
}
.avatar-border {
  border: 4px solid #1e293b;
}
.edit-avatar-btn {
  bottom: 0;
  right: -5px;
  border: 2px solid #1e293b;
}
.close-btn-shadow {
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(4px);
}
.premium-input .q-field__control {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}
.bg-dark-soft {
  background-color: #0f172a;
}
.letter-spacing-1 {
  letter-spacing: 0.5px;
}
</style>
