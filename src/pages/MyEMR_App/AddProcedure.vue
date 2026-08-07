<template>
  <q-page padding class="dashboard-background flex justify-center">
    <div style="width: 100%; max-width: 1400px;">

      <div class="content-wrapper">

        <div class="header-section glass-panel q-pa-md q-mb-lg row items-center justify-between list-item-animation" style="animation-delay: 0.1s;">
          <div class="row items-center no-wrap" style="width: 100%">

            <div class="row items-center no-wrap col-grow">
              <div class="icon-box-flat q-mr-md">
                <q-icon name="edit_note" size="32px" color="white" />
              </div>
              <div>
                <div class="text-h5 text-weight-bold text-white header-title">{{ isEditMode ? 'แก้ไขข้อมูลการรักษา' : 'เพิ่มข้อมูลการรักษา' }}</div>
                <div class="text-caption text-cyan-3">Medical Record Entry</div>
              </div>
            </div>

            <div class="col-auto row items-center">
              <div class="column items-end q-mr-md gt-xs">
                <div class="text-caption text-grey-4">ความสมบูรณ์ของข้อมูล</div>
                <div class="text-caption text-cyan-3 text-weight-bold">{{ (formProgress * 100).toFixed(0) }}%</div>
              </div>

              <q-circular-progress
                show-value
                font-size="12px"
                :value="formProgress * 100"
                size="50px"
                :thickness="0.22"
                color="cyan-3"
                track-color="grey-8"
                class="q-mr-md"
              >
                {{ (formProgress * 100).toFixed(0) }}%
              </q-circular-progress>

              <q-btn flat round icon="delete_sweep" color="red-4" class="q-mr-sm" @click="confirmClearAll">
                <q-tooltip class="bg-red text-white">ล้างข้อมูลทั้งหมด (Reset Form)</q-tooltip>
              </q-btn>

              <q-btn flat round icon="history" color="grey-4" @click="toggleHistory">
                <q-tooltip class="bg-black">ประวัติการบันทึก</q-tooltip>
              </q-btn>
            </div>

          </div>

          <q-linear-progress v-if="$q.screen.lt.sm" dark rounded size="6px" :value="formProgress" color="cyan-3" class="q-mt-md full-width" />
        </div>

        <q-card class="glass-panel q-mb-lg list-item-animation" style="animation-delay: 0.2s;">
          <q-card-section>
            <div class="section-header">
              <q-icon name="person_search" />
              <span>ข้อมูลผู้ป่วย</span>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  dark dense outlined
                  v-model="selectedPatientIdObject"
                  label="ค้นหาด้วย ID ผู้ป่วย"
                  :options="patientIdOptions"
                  use-input input-debounce="0"
                  @filter="filterPatientId"
                  @update:model-value="(newValue) => { handlePatientSelection(newValue); playSelectionSound(); }"
                  @popup-show="playFormFocusSound"
                  @clear="clearForm"
                  clearable
                  :disable="isEditMode"
                  class="flat-input"
                >
                  <template v-slot:prepend><q-icon name="badge" color="cyan-3"/></template>
                  <template v-slot:no-option><q-item><q-item-section class="text-grey">ไม่พบข้อมูล</q-item-section></q-item></template>
                </q-select>
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  dark dense outlined
                  v-model="selectedPatientNameObject"
                  label="ค้นหาด้วยชื่อผู้ป่วย"
                  :options="patientNameOptions"
                  use-input input-debounce="0"
                  @filter="filterPatientName"
                  @update:model-value="(newValue) => { handlePatientSelection(newValue); playSelectionSound(); }"
                  @popup-show="playFormFocusSound"
                  @clear="clearForm"
                  clearable
                  :disable="isEditMode"
                  class="flat-input"
                >
                  <template v-slot:prepend><q-icon name="face" color="cyan-3"/></template>
                  <template v-slot:option="scope"><q-item v-bind="scope.itemProps"><q-item-section><q-item-label>{{ scope.opt.label }}</q-item-label><q-item-label caption>{{ scope.opt.value }}</q-item-label></q-item-section></q-item></template>
                  <template v-slot:no-option><q-item><q-item-section class="text-grey">ไม่พบข้อมูล</q-item-section></q-item></template>
                </q-select>
              </div>
            </div>

            <q-slide-transition>
              <div v-if="patientInfo.id" class="patient-details-box q-pa-md q-mt-md">
                <div class="row items-center q-col-gutter-md">
                  <div class="col-auto">
                    <div class="avatar-wrapper" @click="openImagePreview(patientInfo)">
                        <q-avatar size="80px" class="shadow-3">
                            <img v-if="getPatientAvatar(patientInfo)" :src="getPatientAvatar(patientInfo)" style="object-fit: cover;">
                            <q-icon v-else name="person" color="white" class="bg-gradient-primary fit" />
                        </q-avatar>
                        <div class="zoom-overlay"><q-icon name="zoom_in" color="white" /></div>
                    </div>
                  </div>
                  <div class="col">
                    <div class="text-h5 text-white text-weight-bold">{{ patientInfo.name }}</div>
                    <div class="text-subtitle2 text-cyan-3 q-mb-sm">ID: {{ patientInfo.patientId }}</div>

                    <div class="row q-gutter-x-md text-grey-4">
                      <div v-if="patientInfo.gender"><q-icon name="male" v-if="patientInfo.gender === 'ชาย'"/><q-icon name="female" v-else/> {{ patientInfo.gender }}</div>
                      <div v-if="patientInfo.age !== null"><q-icon name="cake" /> {{ patientInfo.age }} ปี</div>
                    </div>
                  </div>
                  <div class="col-12 col-md-auto text-right">
                    <div class="q-gutter-y-xs">
                        <q-chip :color="patientInfo.underlyingDiseases !== 'ไม่มี' ? 'orange-9' : 'green-9'" text-color="white" icon="monitor_heart">
                            โรคประจำตัว: {{ patientInfo.underlyingDiseases }}
                        </q-chip>
                        <br>
                        <q-chip :color="patientInfo.drugAllergies !== 'ไม่มี' ? 'red-9' : 'green-9'" text-color="white" icon="warning">
                            แพ้ยา: {{ patientInfo.drugAllergies }}
                        </q-chip>
                        <br>
                        <q-chip :color="patientInfo.foodAllergies && patientInfo.foodAllergies !== 'ไม่มี' ? 'red-9' : 'green-9'" text-color="white" icon="restaurant">
                            แพ้อาหาร: {{ patientInfo.foodAllergies || 'ไม่มี' }}
                        </q-chip>
                    </div>
                  </div>
                </div>
              </div>
            </q-slide-transition>
          </q-card-section>
        </q-card>

        <q-card class="glass-panel q-mb-lg list-item-animation" style="animation-delay: 0.3s;" :class="{ 'form-disabled': isFormLocked }">
          <q-card-section>
            <div class="section-header">
              <q-icon name="monitor_heart" />
              <span>บันทึกสัญญาณชีพ (Vital Signs)</span>
            </div>
            <div class="row q-col-gutter-md q-mb-sm">
              <div class="col-6 col-md-3"><q-select dark dense outlined v-model="newVitalSign.temperature" label="อุณหภูมิ (°C) (*)" :options="tempOptions" use-input input-debounce="0" @filter="filterTemp" @new-value="addNewDecimalOption" @blur="event => handleVitalSignBlur(event, 'temperature')" clearable @clear="() => newVitalSign.temperature = null" class="flat-input" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound"><template v-slot:prepend><q-icon name="thermostat" color="orange-4" /></template></q-select></div>
              <div class="col-6 col-md-3"><q-select dark dense outlined v-model="newVitalSign.pulse" label="ชีพจร (ครั้ง/นาที) (*)" :options="pulseOptions" use-input input-debounce="0" @filter="filterPulse" @new-value="addNewIntegerOption" @blur="event => handleVitalSignBlur(event, 'pulse')" clearable @clear="() => newVitalSign.pulse = null" class="flat-input" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound"><template v-slot:prepend><q-icon name="favorite" color="red-4" /></template></q-select></div>
              <div class="col-6 col-md-3"><q-select dark dense outlined v-model="newVitalSign.breathing" label="การหายใจ (ครั้ง/นาที) (*)" :options="breathingOptions" use-input input-debounce="0" @filter="filterBreathing" @new-value="addNewIntegerOption" @blur="event => handleVitalSignBlur(event, 'breathing')" clearable @clear="() => newVitalSign.breathing = null" class="flat-input" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound"><template v-slot:prepend><q-icon name="air" color="blue-3" /></template></q-select></div>
              <div class="col-6 col-md-3"><q-select dark dense outlined v-model="newVitalSign.oxygenSaturation" label="O2 Sat (%)" :options="o2SatOptions" use-input input-debounce="0" @filter="filterO2Sat" @new-value="addNewIntegerOption" @blur="event => handleVitalSignBlur(event, 'oxygenSaturation')" clearable @clear="() => newVitalSign.oxygenSaturation = null" class="flat-input" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound"><template v-slot:prepend><q-icon name="water_drop" color="light-blue-3" /></template></q-select></div>
              <div class="col-6 col-md-3"><q-select dark dense outlined v-model="newVitalSign.bloodPressureSystolic" label="ความดัน (Systolic) (*)" :options="bpSysOptions" use-input input-debounce="0" @filter="filterBpSys" @new-value="addNewIntegerOption" @blur="event => handleVitalSignBlur(event, 'bloodPressureSystolic')" clearable @clear="() => newVitalSign.bloodPressureSystolic = null" class="flat-input" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound"><template v-slot:prepend><q-icon name="arrow_upward" color="pink-3" /></template></q-select></div>
              <div class="col-6 col-md-3"><q-select dark dense outlined v-model="newVitalSign.bloodPressureDiastolic" label="ความดัน (Diastolic) (*)" :options="bpDiaOptions" use-input input-debounce="0" @filter="filterBpDia" @new-value="addNewIntegerOption" @blur="event => handleVitalSignBlur(event, 'bloodPressureDiastolic')" clearable @clear="() => newVitalSign.bloodPressureDiastolic = null" class="flat-input" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound"><template v-slot:prepend><q-icon name="arrow_downward" color="pink-3" /></template></q-select></div>
              <div class="col-6 col-md-3"><q-select dark dense outlined v-model="newVitalSign.height" label="ส่วนสูง (ซม.)" :options="heightOptions" use-input input-debounce="0" @filter="filterHeight" @new-value="addNewIntegerOption" @blur="event => handleVitalSignBlur(event, 'height')" @update:model-value="() => { calculateBMI(); playSelectionSound(); }" clearable @clear="() => newVitalSign.height = null" class="flat-input" @popup-show="playFormFocusSound"><template v-slot:prepend><q-icon name="height" /></template></q-select></div>
              <div class="col-6 col-md-3"><q-select dark dense outlined v-model="newVitalSign.weight" label="น้ำหนัก (กก.)" :options="weightOptions" use-input input-debounce="0" @filter="filterWeight" @new-value="addNewDecimalOption" @blur="event => handleVitalSignBlur(event, 'weight')" @update:model-value="() => { calculateBMI(); playSelectionSound(); }" clearable @clear="() => newVitalSign.weight = null" class="flat-input" @popup-show="playFormFocusSound"><template v-slot:prepend><q-icon name="monitor_weight" /></template></q-select></div>
              <div class="col-6 col-md-3"><q-select dark dense outlined v-model="newVitalSign.waist" label="รอบเอว (ซม.)" :options="waistOptions" use-input input-debounce="0" @filter="filterWaist" @new-value="addNewIntegerOption" @blur="event => handleVitalSignBlur(event, 'waist')" clearable @clear="() => newVitalSign.waist = null" class="flat-input" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound"><template v-slot:prepend><q-icon name="straighten" /></template></q-select></div>
              <div class="col-6 col-md-3"><q-input dark dense outlined v-model="newVitalSign.bmi" label="BMI" readonly class="flat-input"><template v-slot:prepend><q-icon name="fitness_center" /></template></q-input></div>
            </div>
            <div v-if="bmiInterpretation" class="q-mt-md">
              <q-banner inline-actions rounded-borders :class="bmiInterpretation.styleClass">
                <template v-slot:avatar><q-icon :name="bmiInterpretation.icon" size="md" /></template>
                <div class="text-weight-bold">{{ bmiInterpretation.title }}</div>
                <div>{{ bmiInterpretation.text }}</div>
              </q-banner>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="glass-panel q-mb-lg list-item-animation" style="animation-delay: 0.4s;" :class="{ 'form-disabled': isFormLocked }">
          <q-card-section>
            <div class="section-header">
              <q-icon name="sick" />
              <span>อาการและการซักประวัติ</span>
            </div>

            <div class="text-subtitle1 welcome-text q-mb-xs">อาการสำคัญที่นำมา (Chief Complaint)</div>
            <div class="q-mb-md">
              <q-select
                dark dense outlined
                ref="symptomSelectRef"
                v-model="chiefComplaintNames"
                label="เลือกหรือพิมพ์อาการสำคัญ (*)"
                multiple use-chips use-input emit-value map-options
                option-value="name" option-label="name"
                input-debounce="0"
                @new-value="createSymptom"
                @filter="filterSymptoms"
                :options="symptomOptions"
                class="flat-input"
                @popup-show="playFormFocusSound"
                @remove="playRemoveSound"
              >
                <template v-slot:no-option>
                  <q-item><q-item-section class="text-grey">ไม่พบอาการ, พิมพ์แล้วกด Enter เพื่อเพิ่ม</q-item-section></q-item>
                </template>
              </q-select>
            </div>

            <div v-if="symptomDetails.length > 0" class="q-mb-md">
              <q-list class="themed-list">
                <q-item v-for="(symptom, index) in symptomDetails" :key="`${symptom.name}-${index}`">
                  <q-item-section avatar>
                      <q-icon color="cyan-3" name="radio_button_checked" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-body1 text-white">
                      {{ symptom.name }}
                      <q-badge
                        :class="[`pain-badge--${symptom.level}`, 'cursor-pointer']"
                        class="q-ml-sm shadow-1"
                        v-if="symptom.level"
                        @click="openPainLevelEditor(symptom)"
                      >
                        {{ symptom.level }}
                      </q-badge>
                    </q-item-label>
                    <q-item-label v-if="symptom.locations && symptom.locations.length" caption class="text-grey-5">ตำแหน่ง: {{ symptom.locations.join(', ') }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat dense
                      :label="symptom.duration || 'ระบุเวลา'"
                      :color="symptom.duration ? 'cyan-3' : 'grey-6'"
                      icon-right="edit_calendar"
                      @click="openDurationDialog(symptom)"
                      class="duration-btn"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="text-subtitle1 welcome-text q-mt-lg q-mb-sm">ระบุตำแหน่งที่มีอาการ (คลิกที่หุ่น)</div>

            <div class="body-model-wrapper q-pa-md" @mousemove="updateTooltipPosition" @mouseleave="hoveredPartName = null">

              <Teleport to="body">
                <div v-show="hoveredPartName" class="floating-tooltip" :style="tooltipStyle">
                  {{ hoveredPartName }}
                </div>
              </Teleport>

              <div class="body-flip-container" :class="{ 'is-flipped': modelView === 'back' }">

                <div class="body-face body-front">
                    <svg id="human-body-front" viewBox="0 0 450 480" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <radialGradient id="injury-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                          <stop offset="0%" style="stop-color:rgb(255,100,100);stop-opacity:1" />
                          <stop offset="100%" style="stop-color:rgb(200,0,0);stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="pain-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                          <stop offset="0%" style="stop-color:rgb(255, 200, 130);stop-opacity:1" />
                          <stop offset="100%" style="stop-color:rgb(249, 115, 22);stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="irritation-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                          <stop offset="0%" style="stop-color:rgb(255, 255, 170);stop-opacity:1" />
                          <stop offset="100%" style="stop-color:rgb(234, 179, 8);stop-opacity:1" />
                        </radialGradient>
                      </defs>
                      <g id="body-parts-front">
                          <path v-for="(path, id) in frontBodyPaths" :key="id"
                                class="body-part"
                                :d="path.d"
                                :class="getPainLevelClass(id)"
                                @click="showSymptomSelector(id, path.label)"
                                @mouseenter="hoveredPartName = path.label"
                                @mouseleave="hoveredPartName = null"
                          />
                      </g>
                    </svg>
                </div>

                <div class="body-face body-back">
                    <svg id="human-body-back" viewBox="0 0 450 480" xmlns="http://www.w3.org/2000/svg">
                       <g id="body-parts-back">
                          <path v-for="(path, id) in backBodyPaths" :key="id"
                                class="body-part"
                                :d="path.d"
                                :class="getPainLevelClass(id)"
                                @click="showSymptomSelector(id, path.label)"
                                @mouseenter="hoveredPartName = path.label"
                                @mouseleave="hoveredPartName = null"
                          />
                       </g>
                    </svg>
                </div>

              </div>

              <q-btn
                round color="cyan-3" text-color="dark" icon="3d_rotation"
                class="absolute-top-right q-ma-md shadow-5 z-top flip-btn"
                @click="toggleModelView"
              >
                <q-tooltip>หมุนตัว</q-tooltip>
              </q-btn>

            </div>

            <div class="text-subtitle1 welcome-text q-mt-lg">ชุดอาการสำเร็จรูป (Symptom Templates)</div>
            <div class="row q-gutter-sm q-mb-md">
              <q-btn v-for="(template, name) in symptomTemplates" :key="name"
                unelevated class="symptom-template-btn"
                :label="template.label" :icon="template.icon"
                @click="applySymptomTemplate(name)"
              />
            </div>

            <div class="text-subtitle1 welcome-text q-mt-md">รายละเอียดอาการเพิ่มเติม (Present Illness)</div>
            <q-input dark dense outlined v-model="presentIllness" label="กรอกรายละเอียด หรือเลือกจากคำแนะนำด้านล่าง" type="textarea" autogrow class="flat-input" @focus="playFormFocusSound"/>

            <q-slide-transition>
                <div v-if="dynamicSuggestions.length > 0" class="q-mt-sm">
                  <div class="text-caption text-grey-5 q-mb-xs">คำแนะนำ:</div>
                  <div class="row q-gutter-sm">
                      <q-chip
                        v-for="suggestion in dynamicSuggestions" :key="suggestion"
                        clickable outline color="cyan-3" text-color="white" icon="add"
                        @click="addDetailToIllness(suggestion)"
                        class="suggestion-chip"
                      >
                        {{ suggestion }}
                      </q-chip>
                  </div>
                </div>
            </q-slide-transition>

            <q-separator dark class="q-my-lg" />
            <div class="text-subtitle1 welcome-text">การซักประวัติเพิ่มเติมตามระบบ (Review of Systems)</div>
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6"><q-select dark dense outlined v-model="reviewOfSystems.general" multiple :options="rosOptions.general" use-chips stack-label label="อาการทั่วไป" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound" class="flat-input"/></div>
              <div class="col-12 col-md-6"><q-select dark dense outlined v-model="reviewOfSystems.headAndNeck" multiple :options="rosOptions.headAndNeck" use-chips stack-label label="ศีรษะและลำคอ" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound" class="flat-input"/></div>
              <div class="col-12 col-md-6"><q-select dark dense outlined v-model="reviewOfSystems.respiratory" multiple :options="rosOptions.respiratory" use-chips stack-label label="ระบบทางเดินหายใจ" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound" class="flat-input"/></div>
              <div class="col-12 col-md-6"><q-select dark dense outlined v-model="reviewOfSystems.cardiovascular" multiple :options="rosOptions.cardiovascular" use-chips stack-label label="ระบบหัวใจและหลอดเลือด" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound" class="flat-input"/></div>
              <div class="col-12 col-md-6"><q-select dark dense outlined v-model="reviewOfSystems.gastrointestinal" multiple :options="rosOptions.gastrointestinal" use-chips stack-label label="ระบบทางเดินอาหาร" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound" class="flat-input"/></div>
              <div class="col-12 col-md-6"><q-select dark dense outlined v-model="reviewOfSystems.skin" multiple :options="rosOptions.skin" use-chips stack-label label="ระบบผิวหนัง" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound" class="flat-input"/></div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="glass-panel q-mb-xl list-item-animation" style="animation-delay: 0.5s;" :class="{ 'form-disabled': isFormLocked }">
          <q-card-section>
            <div class="section-header">
              <q-icon name="medical_services" />
              <span>การรักษาและการส่งต่อ</span>
            </div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-md-6"><q-select dark dense outlined v-model="newProcedureItem.service" label="บริการ" :options="serviceOptions" class="flat-input" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound"/></div>
              <div class="col-12 col-md-6"><q-select dark dense outlined v-model="newProcedureItem.procedure" label="หัตถการ" :options="procedureOptions" :disable="isProcedureDisabled" use-input input-debounce="0" @filter="filterProcedure" class="flat-input" @popup-show="playFormFocusSound" @update:model-value="playSelectionSound"/></div>
              <div class="col-12"><q-input dark dense outlined v-model="newProcedureItem.notes" label="บันทึกเพิ่มเติม" type="textarea" autogrow class="flat-input" @focus="playFormFocusSound"/></div>
              <div class="col-12 q-mt-sm row" style="gap: 8px;">
                <q-btn class="positive-action-btn" icon="add_circle" label="เพิ่มการรักษา" @click="addProcedure" :disable="!newProcedureItem.service"/>
                <q-btn class="negative-action-btn" icon="cancel" label="ไม่รับการรักษา" @click="addDeclinedProcedure"/>
              </div>
            </div>

            <div v-if="procedures.length > 0">
              <q-separator class="q-my-md" dark /><div class="text-subtitle1 welcome-text">รายการที่เลือก</div>
              <q-list class="themed-list">
                <q-item v-for="(procedure, index) in procedures" :key="index">
                  <q-item-section>
                    <q-item-label class="text-white">บริการ: {{ procedure.service }}</q-item-label>
                    <q-item-label caption class="text-grey-5">หัตถการ: {{ procedure.procedure }} | บันทึก: {{ procedure.notes || '-' }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat round icon="delete" color="red-4" @click="removeProcedure(index)"/>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <q-separator class="q-my-lg" dark />
            <div class="text-subtitle1 welcome-text q-mb-sm">การส่งต่อผู้ป่วย (Referral)</div>
            <div class="row" style="gap: 8px;">
                <q-btn :class="['choice-btn', {'choice-btn--active-positive': referralChoice === 'refer'}]" icon="check_circle" label="ส่งต่อ" @click="referralChoice = 'refer'; playSelectionSound()" />
                <q-btn :class="['choice-btn', {'choice-btn--active-negative': referralChoice === 'no_referral'}]" icon="cancel" label="ไม่ส่งต่อ" @click="referralChoice = 'no_referral'; playSelectionSound()" />
            </div>
            <div v-if="referralChoice === 'refer'">
              <div class="row q-col-gutter-sm q-mb-md q-mt-sm">
                <div class="col-12 col-md-6"><q-select dark dense outlined v-model="selectedDepartment" label="เลือกแผนก" :options="departmentOptions" clearable @popup-show="playFormFocusSound" @update:model-value="playSelectionSound" class="flat-input"/></div>
                <div class="col-12 col-md-6"><q-select dark dense outlined v-model="selectedDoctor" label="เลือกแพทย์" :options="filteredDoctorOptions" :disable="!selectedDepartment" clearable @popup-show="playFormFocusSound" @update:model-value="playSelectionSound" class="flat-input">
                  <template v-slot:no-option><q-item><q-item-section class="text-grey">กรุณาเลือกแผนกก่อน</q-item-section></q-item></template>
                </q-select></div>
              </div>
            </div>
            <div class="col-12"><q-input dark dense outlined v-model="referralNotes" label="หมายเหตุการส่งต่อ (ถ้ามี)" type="textarea" autogrow class="flat-input q-mt-sm" @focus="playFormFocusSound"/></div>
          </q-card-section>
        </q-card>

      </div>

      <q-footer class="action-footer">
        <div class="content-wrapper q-pa-md row items-center justify-between" style="max-width: 1400px; margin: 0 auto; padding-bottom: 20px;">

          <div class="row items-center welcome-text">
             <q-avatar size="32px" class="q-mr-sm shadow-2">
                <img v-if="authStore.user?.avatar_url" :src="`https://emr-backend-api-8euv.onrender.com${authStore.user.avatar_url}`">
                <q-icon v-else name="support_agent" color="white" class="bg-gradient-primary fit" />
             </q-avatar>
             <div>
                <div class="text-caption text-cyan-3" style="line-height: 1;">ผู้บันทึกข้อมูล</div>
                <div class="text-subtitle2 text-white">{{ recordingNurse }}</div>
             </div>
          </div>

          <div class="row items-center q-gutter-md">
              <q-btn class="cert-btn" @click="openCertificateDialog" label="ใบรับรองแพทย์" icon="description" :disable="isFormLocked" unelevated/>
              <q-btn class="save-btn" @click="confirmAndSaveDraft" label="บันทึกร่าง" icon="save" :disable="isFormLocked" unelevated/>
              <q-btn class="primary-action-btn" @click="completeTreatment" label="ยืนยันการส่งต่อ" icon="send" :disable="isFormLocked" unelevated/>
          </div>
        </div>
      </q-footer>

      <q-dialog v-model="bodyPartDialog.show">
          <q-card class="glass-panel" style="width: 400px;">
            <q-card-section class="bg-white-05 text-white">
                <div class="text-h6">อาการ: {{ bodyPartDialog.title }}</div>
            </q-card-section>
            <q-card-section>
                <div class="text-subtitle2 text-grey-4 q-mb-sm">ระดับ:</div>
                <q-option-group v-model="bodyPartDialog.level" :options="painLevelOptions" color="cyan-3" type="radio" dark inline class="q-mb-md" />
                <div class="text-subtitle2 text-grey-4 q-mb-sm">อาการ:</div>
                <q-option-group v-model="bodyPartDialog.selected" :options="bodyPartDialog.options" color="cyan-3" type="checkbox" dark />
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat label="ยกเลิก" v-close-popup color="grey-5" />
                <q-btn label="ยืนยัน" color="cyan-6" @click="addSymptomsFromModel" v-close-popup :disable="bodyPartDialog.selected.length === 0" unelevated/>
            </q-card-actions>
          </q-card>
      </q-dialog>

      <q-dialog v-model="showCertificateDialog" maximized transition-show="slide-up" transition-hide="slide-down">
        <MedicalCertificate
          :patient-name="certificateData.patientName"
          :patient-age="certificateData.patientAge"
          :patient-id-card="certificateData.patientIdCard"
          :patient-address="certificateData.patientAddress"
          :doctor-name="certificateData.doctorName"
          :doctor-license="certificateData.doctorLicense"
          :date="certificateData.examDate"
          :vitals="certificateData.vitals"
          :diagnosis="certificateData.diagnosis"
          :opinion="certificateData.opinion"
        />
      </q-dialog>

      <q-dialog v-model="showImagePreview" backdrop-filter="blur(8px)">
        <q-card class="bg-transparent shadow-none no-shadow" style="min-width: 300px; max-width: 90vw;">
          <div class="column items-center relative-position">
            <q-img
              v-if="currentImageSrc"
              :src="currentImageSrc"
              class="rounded-borders shadow-20"
              style="max-height: 80vh; max-width: 100%; border: 4px solid rgba(255,255,255,0.1);"
              spinner-color="white"
            />
             <q-avatar v-else size="200px" color="primary" text-color="white" icon="person" class="shadow-10" />
            <div class="text-white text-h5 q-mt-md text-weight-bold text-shadow">{{ currentImageName }}</div>
            <q-btn round color="white" text-color="black" icon="close" class="absolute-top-right q-ma-md shadow-10" v-close-popup style="top: -20px; right: -20px;" />
          </div>
        </q-card>
      </q-dialog>
      <!-- 👇👇👇 1. วางโค้ด Guide Modal ตรงนี้ 👇👇👇 -->
    <q-dialog v-model="showGuideModal" persistent backdrop-filter="blur(4px)">
      <q-card class="bg-dark text-white" style="width: 450px; max-width: 90vw; border: 1px solid rgba(34, 211, 238, 0.4); border-radius: 12px; box-shadow: 0 0 15px rgba(34, 211, 238, 0.2); overflow: hidden;">

        <!-- Header สไตล์เกม -->
        <q-card-section class="row items-center q-pb-sm bg-blue-grey-10" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div class="text-h6 text-cyan-3 font-weight-bold row items-center" style="font-family: 'Cinzel', serif; letter-spacing: 1px;">
            <q-icon name="sports_esports" size="sm" class="q-mr-sm" />
            SYSTEM GUIDE
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="markGuideAsSeen" color="grey-5" class="hover-icon-red" />
        </q-card-section>

        <!-- Content จัดเลย์เอาต์ใหม่ให้อ่านง่าย -->
        <q-card-section class="q-pa-lg">

          <!-- System Notice -->
          <div class="q-mb-lg q-pa-sm text-center text-cyan-2 rounded-borders text-caption shadow-1" style="background: rgba(34, 211, 238, 0.08); border: 1px solid rgba(34, 211, 238, 0.2); letter-spacing: 0.5px;">
            <q-icon name="lightbulb" class="q-mr-xs" size="xs" />
            แดชบอร์ดแพทย์: จัดการคิวที่พยาบาลส่งต่อมา (State Machine)
          </div>

          <!-- Checklist -->
          <div class="q-gutter-y-lg text-body1 text-grey-3 q-mt-sm">

            <!-- Item 1 -->
            <div class="row items-start no-wrap">
              <q-avatar size="42px" color="orange-10" text-color="orange-4" class="q-mr-md shadow-2 q-mt-xs">
                <q-icon name="event_available" size="22px"/>
              </q-avatar>
              <div class="col">
                <div class="text-white text-weight-bold" style="font-size: 1.05rem; line-height: 1.3;">Smart Dropdown วันที่</div>
                <div class="text-caption text-grey-5 q-mt-xs" style="line-height: 1.4;">ทดสอบเลือกวันที่ (ระบบจะแสดงจุดสีเขียว หากวันนั้นมีคิวตรวจ)</div>
              </div>
            </div>

            <!-- Item 2 -->
            <div class="row items-start no-wrap">
              <q-avatar size="42px" color="pink-10" text-color="pink-4" class="q-mr-md shadow-2 q-mt-xs">
                <q-icon name="filter_list" size="22px"/>
              </q-avatar>
              <div class="col">
                <div class="text-white text-weight-bold" style="font-size: 1.05rem; line-height: 1.3;">กรองคิวผู้ป่วย</div>
                <div class="text-caption text-grey-5 q-mt-xs" style="line-height: 1.4;">คลิกปุ่มสถานะด้านบน เพื่อแยกดูคิว รอพบแพทย์ หรือ ตรวจเสร็จสิ้น</div>
              </div>
            </div>

            <!-- Item 3 -->
            <div class="row items-start no-wrap">
              <q-avatar size="42px" color="blue-10" text-color="blue-4" class="q-mr-md shadow-2 q-mt-xs">
                <q-icon name="touch_app" size="22px"/>
              </q-avatar>
              <div class="col">
                <div class="text-white text-weight-bold" style="font-size: 1.05rem; line-height: 1.3;">เข้าสู่การตรวจรักษา</div>
                <div class="text-caption text-grey-5 q-mt-xs" style="line-height: 1.4;">คลิกที่การ์ดผู้ป่วยในคิว เพื่อเข้าสู่หน้าจอวินิจฉัยและสั่งยา</div>
              </div>
            </div>

          </div>
        </q-card-section>

        <!-- Footer -->
        <q-card-actions align="center" class="q-pa-md bg-blue-grey-10" style="border-top: 1px solid rgba(255,255,255,0.05);">
          <q-btn
            unelevated
            class="full-width text-weight-bold"
            color="cyan-6"
            text-color="black"
            label="START TESTING"
            @click="markGuideAsSeen"
            v-close-popup
            style="border-radius: 8px; font-size: 16px; letter-spacing: 2px;"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>
    <!-- 👆👆👆 สิ้นสุด Guide Modal 👆👆👆 -->

    </div>
  </q-page>
</template>
<script setup>
import * as Tone from 'tone';
import { reactive, ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar, date } from 'quasar';
import axios from 'axios';

// 🔥 1. IMPORT STORE เพื่อดึงข้อมูลพยาบาลที่ล็อกอินอยู่
import { useAuthStore } from 'src/store/auth';
const authStore = useAuthStore(); // เรียกใช้ Store

import MedicalCertificate from 'src/components/MedicalCertificate.vue';

// =========================
// 1. SOUND SYSTEM (คงเดิมไว้)
// =========================
const createSynth = (synth, options, volume) => { const s = new synth(options).toDestination(); s.volume.value = volume; return s; };
const clickSynth = createSynth(Tone.FMSynth, { harmonicity: 8, modulationIndex: 2, oscillator: { type: "sine" }, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }, modulation: { type: "square" }, modulationEnvelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.2 } }, -10);
const formFocusSynth = createSynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.1 } }, -20);
const selectionSynth = createSynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.1 } }, -16);
const removeSynth = createSynth(Tone.MembraneSynth, { pitchDecay: 0.05, octaves: 10, oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: 'exponential' } }, -12);
let isRemoving = false;

const playSound = (synth, note, duration) => {
  // เปิดคอมเมนต์บรรทัดล่างเมื่อต้องการเสียงจริง
  // if (Tone.context.state !== 'running') Tone.context.resume();
  // synth.triggerAttackRelease(note, duration, Tone.now());
};

const playClickSound = () => playSound(clickSynth, "C5", "32n");
const playFormFocusSound = () => playSound(formFocusSynth, "G5", "32n");
const playSelectionSound = () => { if (!isRemoving) playSound(selectionSynth, "C6", "16n"); };
const playRemoveSound = () => {
  playSound(removeSynth, "C2", "8n");
  isRemoving = true;
  setTimeout(() => { isRemoving = false; }, 50);
};
const confirmClearAll = () => {
  playClickSound(); // เสียงคลิก

  $q.dialog({
    title: 'ยืนยันการล้างข้อมูล',
    message: 'คุณต้องการล้างข้อมูลทั้งหมดในหน้านี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
    cancel: true,
    persistent: true,
    ok: { label: 'ล้างข้อมูลทันที', color: 'red-6', unelevated: true, icon: 'delete_forever' },
    cancel: { label: 'ยกเลิก', color: 'grey', flat: true },
    dark: true,
    class: 'glass-panel' // ใช้ธีมกระจกเดียวกับหน้าเว็บ
  }).onOk(() => {
    clearForm(); // เรียกใช้ฟังก์ชัน clearForm เดิมที่มีอยู่แล้ว

    // แจ้งเตือนเมื่อล้างเสร็จ
    $q.notify({
      type: 'positive',
      message: 'ล้างข้อมูลเรียบร้อยแล้ว พร้อมสำหรับเคสใหม่',
      icon: 'cleaning_services',
      position: 'top'
    });
  });
};
// =========================
// 2. MAIN LOGIC
// =========================
const router = useRouter();
const route = useRoute();
const $q = useQuasar();

// Image Preview
const showImagePreview = ref(false);
const currentImageSrc = ref('');
const currentImageName = ref('');

// 👇👇👇 2. วางตัวแปรควบคุม Guide ตรงนี้ 👇👇👇
const showGuideModal = ref(false);
const markGuideAsSeen = () => {
    localStorage.setItem('hasSeenNurseTriageGuide', 'true');
    showGuideModal.value = false;
    playClickSound();
};
// 👆👆👆 สิ้นสุดตัวแปร Guide 👆👆👆

const getPatientAvatar = (pInfo) => {
  if (!pInfo || !pInfo.id) return null;
  const found = allPatients.value.find(p => p.id === pInfo.id);
  if (found && found.avatarUrl) return `https://emr-backend-api-8euv.onrender.com${found.avatarUrl}`;
  if (pInfo.avatarUrl) return `https://emr-backend-api-8euv.onrender.com${pInfo.avatarUrl}`;
  return null;
};

const openImagePreview = (patient) => {
  const avatarUrl = getPatientAvatar(patient);
  currentImageName.value = patient.name || 'ผู้ป่วย';
  if (avatarUrl) {
      currentImageSrc.value = avatarUrl;
      showImagePreview.value = true;
      playSelectionSound();
  } else {
      currentImageSrc.value = null;
      showImagePreview.value = true;
  }
};

const getLocalMySqlDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const referralChoice = ref('no_referral');
const currentVisitId = ref(null);
const visitStatus = ref(null);
const isEditMode = computed(() => !!route.query.visitId);

// 🔥 แก้ไข: ดึงชื่อพยาบาลจาก Store (ถ้าไม่มีใช้ค่า Default)
// 🔥 แก้ไข: ดึงชื่อจริง-นามสกุล ของพยาบาลจาก Store
const recordingNurse = computed(() => {
  const user = authStore.user;

  // 1. ถ้ามีข้อมูล User ครบ ให้รวมคำนำหน้า + ชื่อ + นามสกุล
  if (user && user.first_name) {
    const prefix = user.prefix || '';
    const fname = user.first_name || '';
    const lname = user.last_name || '';
    return `${prefix}${fname} ${lname}`.trim();
  }

  // 2. ถ้าไม่มีชื่อจริง ให้ใช้ Username หรือ Email แทน
  if (authStore.userName) {
    return authStore.userName;
  }

  // 3. ถ้าไม่มีอะไรเลย
  return 'พยาบาล (ไม่ระบุตัวตน)';
});
const allPatients = ref([]);
const selectedPatientIdObject = ref(null);
const selectedPatientNameObject = ref(null);
const patientInfo = ref({ id: '', name: '', patientId: '', gender: '', age: null, drugAllergies: '', foodAllergies: '', underlyingDiseases: '', avatarUrl: null });
const patientIdOptions = ref([]);
const patientNameOptions = ref([]);
const masterPatientIdOptions = ref([]);
const masterPatientNameOptions = ref([]);

const isFormLocked = computed(() => {
  if (!patientInfo.value.id || !currentVisitId.value) return true;
  if (visitStatus.value === 'COMPLETED') return true;
  return false;
});

const newVitalSign = reactive({ temperature: null, pulse: null, breathing: null, bloodPressureSystolic: null, bloodPressureDiastolic: null, oxygenSaturation: null, waist: null, height: null, weight: null, bmi: '' });
const reviewOfSystems = ref({ general: [], headAndNeck: [], respiratory: [], cardiovascular: [], gastrointestinal: [], skin: [] });
const rosOptions = { general: ['มีไข้', 'หนาวสั่น', 'อ่อนเพลีย / ไม่มีแรง', 'เบื่ออาหาร', 'น้ำหนักลด', 'เหงื่อออกกลางคืน'], headAndNeck: ['ปวดศีรษะ', 'เวียนศีรษะ', 'เจ็บคอ', 'ต่อมน้ำเหลืองโต', 'ตาแดง/เคืองตา', 'มองเห็นผิดปกติ', 'หูอื้อ/ปวดหู', 'มีน้ำมูก/คัดจมูก'], respiratory: ['ไอ', 'ไอมีเสมหะ', 'หายใจลำบาก/หอบเหนื่อย', 'เจ็บหน้าอกเวลาหายใจ', 'ไอเป็นเลือด'], cardiovascular: ['เจ็บหน้าอก', 'ใจสั่น', 'บวม', 'นอนราบไม่ได้'], gastrointestinal: ['คลื่นไส้/อาเจียน', 'ปวดท้อง', 'ท้องเสีย', 'ท้องผูก', 'ถ่ายเป็นเลือด/ถ่ายดำ', 'ตัวเหลืองตาเหลือง'], skin: ['ผื่น', 'ตุ่มน้ำ', 'คัน', 'ผิวแห้ง'], };
const procedures = ref([]);
const newProcedureItem = reactive({ service: null, procedure: null, notes: '' });
const serviceOptions = ref([]);
const originalProcedureOptions = ref([]);
const procedureOptions = ref([]);
const isProcedureDisabled = computed(() => newProcedureItem.service === '-');

// 🔥 ตัวแปรสำหรับระบบส่งต่อ (Referral System)
const allDoctors = ref([]);
const selectedDepartment = ref(null);
const selectedDoctor = ref(null); // จะเก็บเป็น Object {label, value}
const referralNotes = ref('');

// 🔥 Computed: ดึงรายชื่อแผนกจากข้อมูลหมอทั้งหมด
const departmentOptions = computed(() => {
    // ดึงแผนกที่ไม่ซ้ำกันออกมา
    const depts = new Set(allDoctors.value.map(d => d.department).filter(d => d));
    return [...depts];
});

// 🔥 Computed: กรองรายชื่อหมอ ตามแผนกที่เลือก
const filteredDoctorOptions = computed(() => {
    if (!selectedDepartment.value) return [];
    return allDoctors.value
        .filter(doctor => doctor.department === selectedDepartment.value)
        .map(doctor => ({ label: doctor.name, value: doctor.id })); // value คือ ID
});

const symptomRecordExists = ref(false);
const procedureRecordExists = ref(false);

watch(referralChoice, (newChoice) => { if (newChoice === 'no_referral') { selectedDepartment.value = null; selectedDoctor.value = null; } });
watch(selectedDepartment, () => { selectedDoctor.value = null; });
const showHistory = ref(false);
const showCertificateDialog = ref(false);

const certificateData = reactive({
    patientName: '',
    patientAddress: '',
    patientIdCard: '',
    patientAge: '',
    doctorName: 'นพ. สมชาย ใจดี',
    doctorLicense: 'ว.12345',
    examDate: date.formatDate(Date.now(), 'YYYY-MM-DD'),
    vitals: { weight: '', height: '', bp: '', pulse: '', temperature: '' },
    diagnosis: '',
    opinion: ''
});

const symptomSelectRef = ref(null);
const symptomDetails = ref([]);
const chiefComplaintNames = computed({
  get() { return symptomDetails.value.map(s => s.name); },
  set(newNames) {
    symptomDetails.value = symptomDetails.value.filter(detail => newNames.includes(detail.name));
    newNames.forEach(name => {
      const isExisting = symptomDetails.value.some(detail => detail.name === name);
      if (!isExisting) { symptomDetails.value.push({ name: name, duration: '', locations: symptomToLocationMap[name] || [], level: 'pain' }); }
    });
  }
});
const presentIllness = ref('');
const masterSymptomList = ref([]);
const symptomOptions = ref([]);
const durationNumber = ref(null);
const durationUnit = ref('วัน');
const durationUnitOptions = ['ชั่วโมง', 'วัน', 'สัปดาห์', 'เดือน', 'ปี'];
const showDurationDialog = ref(false);
const symptomToEdit = ref(null);

// Body Model Logic
const modelView = ref('front');
const hoveredPartName = ref(null);
const tooltipPos = reactive({ x: 0, y: 0 });
const updateTooltipPosition = (e) => { tooltipPos.x = e.clientX + 5; tooltipPos.y = e.clientY + 5; };
const tooltipStyle = computed(() => ({ top: `${tooltipPos.y}px`, left: `${tooltipPos.x}px`, }));
const toggleModelView = () => { modelView.value = modelView.value === 'front' ? 'back' : 'front'; playClickSound(); };

// ... (Body Paths - Code เดิมใช้ได้เลยครับ) ...
const frontBodyPaths = { 'head-upper-left': { d: "M225,20 C185,20 170,50 170,90 H225 V20 Z", label: "หน้าผาก (ซ้าย)" }, 'head-upper-right': { d: "M225,20 C265,20 280,50 280,90 H225 V20 Z", label: "หน้าผาก (ขวา)" }, 'head-lower-left': { d: "M170,90 C170,130 190,145 225,145 V90 H170 Z", label: "ใบหน้า/แก้ม (ซ้าย)" }, 'head-lower-right': { d: "M280,90 C280,130 260,145 225,145 V90 H280 Z", label: "ใบหน้า/แก้ม (ขวา)" }, 'ear-left': { d: "M170,90 a 15 25 0 0 0 -5 25", label: "หู (ซ้าย)" }, 'ear-right': { d: "M280,90 a 15 25 0 0 1 5 25", label: "หู (ขวา)" }, 'eye-left': { d: "M200 95 a 6 6 0 0 1 12 0 a 6 6 0 0 1 -12 0", label: "ตา (ซ้าย)" }, 'eye-right': { d: "M238 95 a 6 6 0 0 1 12 0 a 6 6 0 0 1 -12 0", label: "ตา (ขวา)" }, 'nose': { d: "M223 105 l 2 12 l 2 -12 z", label: "จมูก" }, 'mouth': { d: "M215 128 q 10 7 20 0", label: "ปาก" }, 'neck': { d: "M215 145 H235 V160 H215 V145Z", label: "คอ" }, 'chest-left': { d: "M190,162 C188,185 195,210 225,210 V160 C210,160 195,160 190,162 Z", label: "หน้าอก (ซ้าย)" }, 'chest-right': { d: "M260,162 C262,185 255,210 225,210 V160 C240,160 255,160 260,162 Z", label: "หน้าอก (ขวา)" }, 'abdomen-left': { d: "M225,210 C195,210 188,235 190,260 H225 V210 Z", label: "ช่องท้อง (ซ้าย)" }, 'abdomen-right': { d: "M225,210 C255,210 262,235 260,260 H225 V210 Z", label: "ช่องท้อง (ขวา)" }, 'arm-left': { d: "M190,165 Q165,170 160,220 L180,225 Q185,180 190,165 Z", label: "ต้นแขน (ซ้าย)" }, 'arm-right': { d: "M260,165 Q285,170 290,220 L270,225 Q265,180 260,165 Z", label: "ต้นแขน (ขวา)" }, 'forearm-left': { d: "M160,220 L150,280 L170,285 L180,225 Z", label: "ปลายแขน (ซ้าย)" }, 'forearm-right': { d: "M290,220 L300,280 L280,285 L270,225 Z", label: "ปลายแขน (ขวา)" }, 'hand-left': { d: "M150,280 L140,310 L170,315 L170,285 Z", label: "มือ (ซ้าย)" }, 'hand-right': { d: "M300,280 L310,310 L280,315 L280,285 Z", label: "มือ (ขวา)" }, 'leg-left': { d: "M190,260 L175,350 L215,350 L220,260 Z", label: "ขา (ซ้าย)" }, 'leg-right': { d: "M260,260 L275,350 L235,350 L230,260 Z", label: "ขา (ขวา)" }, 'foot-left': { d: "M175,350 L160,365 L215,365 L215,350 Z", label: "เท้า (ซ้าย)" }, 'foot-right': { d: "M275,350 L290,365 L235,365 L235,350 Z", label: "เท้า (ขวา)" } };
const backBodyPaths = { 'head-back': { d: "M170,90 C170,50 185,20 225,20 C265,20 280,50 280,90 C280,130 260,145 225,145 C190,145 170,130 170,90 Z", label: "ศีรษะด้านหลัง" }, 'neck-back': { d: "M215 145 H235 V160 H215 V145Z", label: "ต้นคอ" }, 'back-upper': { d: "M190,160 C185,210 265,210 260,160 Z", label: "หลังส่วนบน" }, 'back-lower': { d: "M190,210 C185,260 265,260 260,210 Z", label: "หลังส่วนล่าง/เอว" }, 'buttocks': { d: "M190,260 Q225,270 260,260 L255,265 L195,265 Z", label: "ก้น" }, 'arm-left-back': { d: "M190,165 Q165,170 160,220 L180,225 Q185,180 190,165 Z", label: "แขน (ซ้าย)" }, 'arm-right-back': { d: "M260,165 Q285,170 290,220 L270,225 Q265,180 260,165 Z", label: "แขน (ขวา)" }, 'forearm-left-back': { d: "M160,220 L150,280 L170,285 L180,225 Z", label: "ปลายแขน (ซ้าย)" }, 'forearm-right-back': { d: "M290,220 L300,280 L280,285 L270,225 Z", label: "ปลายแขน (ขวา)" }, 'hand-left-back': { d: "M150,280 L140,310 L170,315 L170,285 Z", label: "มือ (ซ้าย)" }, 'hand-right-back': { d: "M300,280 L310,310 L280,315 L280,285 Z", label: "มือ (ขวา)" }, 'leg-left-back': { d: "M190,260 L175,350 L215,350 L220,260 Z", label: "ขา (ซ้าย)" }, 'leg-right-back': { d: "M260,260 L275,350 L235,350 L230,260 Z", label: "ขา (ขวา)" }, 'foot-left-back': { d: "M175,350 L160,365 L215,365 L215,350 Z", label: "เท้า (ซ้าย)" }, 'foot-right-back': { d: "M275,350 L290,365 L235,365 L235,350 Z", label: "เท้า (ขวา)" } };

const painLevelOptions = [ { label: 'ระคายเคือง', value: 'irritation' }, { label: 'ปวด', value: 'pain' }, { label: 'บาดเจ็บ', value: 'injury' }, ];
const painLevelDialog = reactive({ show: false, symptomToEdit: null, selectedLevel: 'pain', });
const openPainLevelEditor = (symptom) => { painLevelDialog.symptomToEdit = symptom; painLevelDialog.selectedLevel = symptom.level; painLevelDialog.show = true; };
const savePainLevel = () => { if (painLevelDialog.symptomToEdit) { painLevelDialog.symptomToEdit.level = painLevelDialog.selectedLevel; } playSelectionSound(); };
const symptomToLocationMap = { 'ปวดหัว': ['head-upper-left', 'head-upper-right', 'head-lower-left', 'head-lower-right', 'head-back'], 'เวียนหัว': ['head-upper-left', 'head-upper-right', 'head-lower-left', 'head-lower-right', 'head-back'], 'ปวดหัวข้างเดียว': ['head-upper-left', 'head-lower-left'], 'ปวดหน้าผากซ้าย': ['head-upper-left'], 'ปวดหน้าผากขวา': ['head-upper-right'], 'ปวดแก้มซ้าย': ['head-lower-left'], 'ปวดกรามซ้าย': ['head-lower-left'], 'ปวดแก้มขวา': ['head-lower-right'], 'ปวดกรามขวา': ['head-lower-right'], 'เจ็บตา': ['eye-left', 'eye-right'], 'เคืองตา': ['eye-left', 'eye-right'], 'เจ็บตาซ้าย': ['eye-left'], 'ตาแดงซ้าย': ['eye-left'], 'เคืองตาซ้าย': ['eye-left'], 'เจ็บตาขวา': ['eye-right'], 'ตาแดงขวา': ['eye-right'], 'เคืองตาขวา': ['eye-right'], 'ปวดหู': ['ear-left', 'ear-right'], 'หูอื้อ': ['ear-left', 'ear-right'], 'ปวดหูซ้าย': ['ear-left'], 'หูอื้อซ้าย': ['ear-left'], 'ปวดหูขวา': ['ear-right'], 'หูอื้อขวา': ['ear-right'], 'คัดจมูก': ['nose'], 'มีน้ำมูก': ['nose'], 'เลือดกำเดาไหล': ['nose'], 'แผลในปาก': ['mouth'], 'เจ็บลิ้น': ['mouth'], 'เจ็บคอ': ['neck', 'mouth'], 'คอเคล็ด': ['neck', 'neck-back'], 'ไอ': ['chest-left', 'chest-right'], 'เจ็บหน้าอก': ['chest-left', 'chest-right'], 'แน่นหน้าอก': ['chest-left', 'chest-right'], 'เจ็บหน้าอกซ้าย': ['chest-left'], 'แน่นหน้าอกซ้าย': ['chest-left'], 'เจ็บหน้าอกขวา': ['chest-right'], 'แน่นหน้าอกขวา': ['chest-right'], 'ปวดท้อง': ['abdomen-left', 'abdomen-right'], 'ท้องอืด': ['abdomen-left', 'abdomen-right'], 'ท้องเสีย': ['abdomen-left', 'abdomen-right'], 'ผื่นคัน': ['back-upper', 'chest-left', 'chest-right', 'arm-left', 'arm-right', 'leg-left', 'leg-right'], 'ปวดท้องซ้าย': ['abdomen-left'], 'ท้องอืดซ้าย': ['abdomen-left'], 'ปวดท้องขวา': ['abdomen-right'], 'ท้องอืดขวา': ['abdomen-right'], 'คลื่นไส้': ['abdomen-left', 'abdomen-right', 'chest-left', 'chest-right'], 'อาเจียน': ['abdomen-left', 'abdomen-right', 'chest-left', 'chest-right'], 'ปวดไหล่': ['arm-left', 'arm-right'], 'ปวดแขน': ['arm-left', 'arm-right', 'forearm-left', 'forearm-right'], 'ปวดแขนซ้าย': ['arm-left', 'forearm-left'], 'แขนซ้ายชา': ['arm-left', 'forearm-left'], 'ปวดแขนขวา': ['arm-right', 'forearm-right'], 'แขนขวาชา': ['arm-right', 'forearm-right'], 'ปวดปลายแขนซ้าย': ['forearm-left'], 'ปวดปลายแขนขวา': ['forearm-right'], 'ปวดมือ': ['hand-left', 'hand-right'], 'ปวดมือซ้าย': ['hand-left'], 'นิ้วล็อคซ้าย': ['hand-left'], 'ปวดมือขวา': ['hand-right'], 'นิ้วล็อคขวา': ['hand-right'], 'ปวดขา': ['leg-left', 'leg-right'], 'ปวดขาซ้าย': ['leg-left'], 'ตะคริวขาซ้าย': ['leg-left'], 'ปวดขาขวา': ['leg-right'], 'ตะคริวขาขวา': ['leg-right'], 'ปวดเท้า': ['foot-left', 'foot-right'], 'ปวดเท้าซ้าย': ['foot-left'], 'ข้อเท้าแพลงซ้าย': ['foot-left'], 'ปวดเท้าขวา': ['foot-right'], 'ข้อเท้าแพลงขวา': ['foot-right'], 'ปวดท้ายทอย': ['head-back', 'neck-back'], 'ปวดต้นคอ': ['neck-back'], 'ปวดหลัง': ['back-upper', 'back-lower'], 'ปวดหลังส่วนบน': ['back-upper'], 'ปวดสะบัก': ['back-upper'], 'ปวดเอว': ['back-lower'], 'ปวดหลังส่วนล่าง': ['back-lower'], 'ปวดก้น': ['buttocks'], 'ฝีที่ก้น': ['buttocks'],};
watch(symptomDetails, (newSymptoms, oldSymptoms) => {
  if (newSymptoms.length > oldSymptoms.length) {
    const newSymptom = newSymptoms[newSymptoms.length - 1];
    if ((!newSymptom.locations || newSymptom.locations.length === 0) && newSymptom.name) {
      const locations = symptomToLocationMap[newSymptom.name] || [];
      if (locations.length > 0) { newSymptom.locations = [...locations]; }
    }
  }
}, { deep: true });
const symptomLocations = computed(() => {
  const locations = {};
  const severityScore = { 'irritation': 1, 'pain': 2, 'injury': 3 };
  symptomDetails.value.forEach(symptom => {
    if (symptom.locations && symptom.locations.length > 0 && symptom.level) {
      symptom.locations.forEach(loc => {
        const currentLevel = locations[loc];
        const newLevel = symptom.level;
        if (!currentLevel || severityScore[newLevel] > severityScore[currentLevel]) {
          locations[loc] = newLevel;
        }
      });
    }
  });
  return locations;
});
const getPainLevelClass = (partId) => { const level = symptomLocations.value[partId]; return level ? `pain--${level}` : ''; };
const symptomDetailMap = { 'ปวดท้อง': ['ปวดบิด', 'ปวดเกร็ง', 'ปวดจี๊ดๆ', 'ปวดแสบ', 'บริเวณลิ้นปี่', 'บริเวณรอบสะือ'], 'ไอ': ['ไอแห้ง', 'ไอมีเสมหะ', 'ไอเป็นเลือด', 'ไอเรื้อรัง'], 'ปวดหัว': ['ปวดตุบๆ', 'ปวดบีบๆ', 'ปวดข้างเดียว', 'ปวดท้ายทอย', 'ปวดกระบอกตา'], 'มีไข้': ['ไข้สูง', 'ไข้ต่ำๆ', 'หนาวสั่น'], 'ปวดหลัง': ['ปวดร้าวลงขา', 'ปวดเมื่อย', 'ปวดจี๊ดๆ'] };
const dynamicSuggestions = computed(() => { return symptomDetails.value.flatMap(symptom => symptomDetailMap[symptom.name] || []); });
const symptomTemplates = { commonCold: { label: 'ชุดไข้หวัด', icon: 'ac_unit', symptoms: ['มีไข้', 'ไอ', 'เจ็บคอ', 'มีน้ำมูก'] }, foodPoisoning: { label: 'ชุดอาหารเป็นพิษ', icon: 'medication_liquid', symptoms: ['คลื่นไส้', 'อาเจียน', 'ปวดท้อง', 'ท้องเสีย'] }, migraine: { label: 'ชุดไมเกรน', icon: 'bolt', symptoms: ['ปวดหัวข้างเดียว', 'คลื่นไส้'] }, officeSyndrome: { label: 'ชุดออฟฟิศซินโดรม', icon: 'desktop_windows', symptoms: ['ปวดหลัง', 'ปวดไหล่', 'ปวดท้ายทอย'] }, };
const applySymptomTemplate = (templateName) => { playClickSound(); const templateSymptoms = symptomTemplates[templateName].symptoms; templateSymptoms.forEach(symptomName => { if (!chiefComplaintNames.value.includes(symptomName)) { chiefComplaintNames.value = [...chiefComplaintNames.value, symptomName]; } }); };
const addDetailToIllness = (detail) => { playSelectionSound(); presentIllness.value = presentIllness.value ? `${presentIllness.value}, ${detail}` : detail; };
const createSymptom = (val, done) => { const newSymptomName = (val || '').trim(); if (newSymptomName.length > 0 && !chiefComplaintNames.value.includes(newSymptomName)) { if (!masterSymptomList.value.some(s => s.name === newSymptomName)) { masterSymptomList.value.unshift({ name: newSymptomName }); } done(newSymptomName, 'add-unique'); } else { done(null); } if (symptomSelectRef.value) { symptomSelectRef.value.updateInputValue(''); } };
const filterSymptoms = (val, update) => { update(() => { if (val === '') { symptomOptions.value = masterSymptomList.value; } else { const needle = val.toLowerCase(); symptomOptions.value = masterSymptomList.value.filter(v => v.name.toLowerCase().includes(needle)); } }) };
const openDurationDialog = (symptom) => { symptomToEdit.value = symptom; prepareDurationEdit(symptom.duration); showDurationDialog.value = true; playFormFocusSound(); };
const prepareDurationEdit = (existingDuration) => { if (existingDuration) { const parts = existingDuration.split(' '); if (parts.length === 2 && !isNaN(parts[0]) && durationUnitOptions.includes(parts[1])) { durationNumber.value = parseInt(parts[0], 10); durationUnit.value = parts[1]; return; } } durationNumber.value = null; durationUnit.value = 'วัน'; };
const saveDuration = () => { if (symptomToEdit.value) { if (durationNumber.value > 0) { symptomToEdit.value.duration = `${durationNumber.value} ${durationUnit.value}`; } else { symptomToEdit.value.duration = ''; } playSelectionSound(); } symptomToEdit.value = null; };
const bodyPartSymptoms = { 'head-upper-left': {symptoms: ['ปวดหน้าผากซ้าย']}, 'head-upper-right': {symptoms: ['ปวดหน้าผากขวา']}, 'head-lower-left': {symptoms: ['ปวดแก้มซ้าย', 'ปวดกรามซ้าย']}, 'head-lower-right': {symptoms: ['ปวดแก้มขวา', 'ปวดกรามขวา']}, 'eye-left': {symptoms: ['เจ็บตาซ้าย', 'ตาแดงซ้าย', 'เคืองตาซ้าย']}, 'eye-right': {symptoms: ['เจ็บตาขวา', 'ตาแดงขวา', 'เคืองตาขวา']}, 'ear-left': {symptoms: ['ปวดหูซ้าย', 'หูอื้อซ้าย']}, 'ear-right': {symptoms: ['ปวดหูขวา', 'หูอื้อขวา']}, 'nose': {symptoms: ['คัดจมูก', 'เลือดกำเดาไหล']}, 'mouth': {symptoms: ['แผลในปาก', 'เจ็บลิ้น']}, 'neck': {symptoms: ['เจ็บคอ', 'คอเคล็ด']}, 'chest-left': {symptoms: ['เจ็บหน้าอกซ้าย', 'แน่นหน้าอกซ้าย']}, 'chest-right': {symptoms: ['เจ็บหน้าอกขวา', 'แน่นหน้าอกขวา']}, 'abdomen-left': {symptoms: ['ปวดท้องซ้าย', 'ท้องอืดซ้าย']}, 'abdomen-right': {symptoms: ['ปวดท้องขวา', 'ท้องอืดขวา']}, 'arm-left': {symptoms: ['ปวดแขนซ้าย', 'แขนซ้ายชา']}, 'arm-right': {symptoms: ['ปวดแขนขวา', 'แขนขวาชา']}, 'forearm-left': {symptoms: ['ปวดปลายแขนซ้าย']}, 'forearm-right': {symptoms: ['ปวดปลายแขนขวา']}, 'hand-left': {symptoms: ['ปวดมือซ้าย', 'นิ้วล็อคซ้าย']}, 'hand-right': {symptoms: ['ปวดมือขวา', 'นิ้วล็อคขวา']}, 'leg-left': {symptoms: ['ปวดขาซ้าย', 'ตะคริวขาซ้าย']}, 'leg-right': {symptoms: ['ปวดขาขวา', 'ตะคริวขาขวา']}, 'foot-left': {symptoms: ['ปวดเท้าซ้าย', 'ข้อเท้าแพลงซ้าย']}, 'foot-right': {symptoms: ['ปวดเท้าขวา', 'ข้อเท้าแพลงขวา']}, 'head-back': {symptoms: ['ปวดท้ายทอย']}, 'neck-back': {symptoms: ['ปวดต้นคอ']}, 'back-upper': {symptoms: ['ปวดหลังส่วนบน', 'ปวดสะบัก']}, 'back-lower': {symptoms: ['ปวดหลังส่วนล่าง', 'ปวดเอว']}, 'buttocks': {symptoms: ['ปวดก้น', 'ฝีที่ก้น']}, };
const bodyPartDialog = reactive({ show: false, title: '', locationId: '', options: [], selected: [], level: 'pain' });
const addSymptomsFromModel = () => {
  const selectedLevel = bodyPartDialog.level;
  const currentLocationId = bodyPartDialog.locationId;

  bodyPartDialog.selected.forEach(originalName => {
    let finalName = originalName;
    if (selectedLevel === 'injury') {
      if (/^(ปวด|เจ็บ|แน่น|เคือง)/.test(originalName)) {
        finalName = originalName.replace(/^(ปวด|เจ็บ|แน่น|เคือง)/, 'บาดเจ็บ');
      } else {
        finalName = `บาดเจ็บที่${originalName}`;
      }
    } else if (selectedLevel === 'irritation') {
      if (/^(ปวด|เจ็บ|แน่น)/.test(originalName)) {
        finalName = originalName.replace(/^(ปวด|เจ็บ|แน่น)/, 'ระคายเคือง');
      } else {
        finalName = `ระคายเคือง${originalName}`;
      }
    }

    const existingSymptom = symptomDetails.value.find(s => s.name === finalName);
    if (existingSymptom) {
      existingSymptom.level = selectedLevel;
      if (!existingSymptom.locations.includes(currentLocationId)) {
        existingSymptom.locations.push(currentLocationId);
      }
    } else {
      symptomDetails.value.push({
        name: finalName,
        duration: '',
        locations: [currentLocationId],
        level: selectedLevel
      });
    }
  });
  playSelectionSound();
};
const showSymptomSelector = (locationId, title) => { const data = bodyPartSymptoms[locationId]; if (!data) return; playClickSound(); bodyPartDialog.locationId = locationId; bodyPartDialog.title = title; bodyPartDialog.options = data.symptoms.map(s => ({ label: s, value: s })); const currentSymptomsOnPart = symptomDetails.value.filter( s => s.locations && s.locations.includes(locationId) ); bodyPartDialog.selected = currentSymptomsOnPart.map(s => s.name); bodyPartDialog.level = currentSymptomsOnPart.length > 0 ? currentSymptomsOnPart[0].level : 'pain'; bodyPartDialog.show = true; };
const vitalSignOptions = { temperature: Array.from({ length: 71 }, (_, i) => (35.0 + i * 0.1).toFixed(1)), pulse: Array.from({ length: 141 }, (_, i) => (40 + i).toString()), breathing: Array.from({ length: 31 }, (_, i) => (10 + i).toString()), oxygenSaturation: Array.from({ length: 21 }, (_, i) => (80 + i).toString()), bloodPressureSystolic: Array.from({ length: 25 }, (_, i) => (80 + i * 5).toString()), bloodPressureDiastolic: Array.from({ length: 17 }, (_, i) => (40 + i * 5).toString()), height: Array.from({ length: 121 }, (_, i) => (100 + i).toString()), weight: Array.from({ length: 241 }, (_, i) => (30.0 + i * 0.5).toFixed(1)), waist: Array.from({ length: 101 }, (_, i) => (50 + i).toString()), };
const tempOptions = ref(vitalSignOptions.temperature); const pulseOptions = ref(vitalSignOptions.pulse); const breathingOptions = ref(vitalSignOptions.breathing); const o2SatOptions = ref(vitalSignOptions.oxygenSaturation); const bpSysOptions = ref(vitalSignOptions.bloodPressureSystolic); const bpDiaOptions = ref(vitalSignOptions.bloodPressureDiastolic); const heightOptions = ref(vitalSignOptions.height); const weightOptions = ref(vitalSignOptions.weight); const waistOptions = ref(vitalSignOptions.waist);
const filterOptions = (val, update, optionsRef, masterOptions) => { update(() => { if (val === '') { optionsRef.value = masterOptions; } else { const needle = val.toLowerCase(); optionsRef.value = masterOptions.filter(v => v.toLowerCase().includes(needle)); } }); };
const filterTemp = (val, update) => filterOptions(val, update, tempOptions, vitalSignOptions.temperature); const filterPulse = (val, update) => filterOptions(val, update, pulseOptions, vitalSignOptions.pulse); const filterBreathing = (val, update) => filterOptions(val, update, breathingOptions, vitalSignOptions.breathing); const filterO2Sat = (val, update) => filterOptions(val, update, o2SatOptions, vitalSignOptions.oxygenSaturation); const filterBpSys = (val, update) => filterOptions(val, update, bpSysOptions, vitalSignOptions.bloodPressureSystolic); const filterBpDia = (val, update) => filterOptions(val, update, bpDiaOptions, vitalSignOptions.bloodPressureDiastolic); const filterHeight = (val, update) => filterOptions(val, update, heightOptions, vitalSignOptions.height); const filterWeight = (val, update) => filterOptions(val, update, weightOptions, vitalSignOptions.weight); const filterWaist = (val, update) => filterOptions(val, update, waistOptions, vitalSignOptions.waist);
const addNewDecimalOption = (val, done) => { if (/^\d*\.?\d+$/.test(val)) { done(val, 'add-unique'); } else { $q.notify({ type: 'negative', message: 'กรุณาป้อนค่าเป็นตัวเลข (ทศนิยมได้)', position: 'top', timeout: 2000 }); } };
const addNewIntegerOption = (val, done) => { if (/^\d+$/.test(val)) { done(val, 'add-unique'); } else { $q.notify({ type: 'negative', message: 'กรุณาป้อนค่าเป็นตัวเลข (จำนวนเต็ม)', position: 'top', timeout: 2000 }); } };
const handleVitalSignBlur = (event, modelKey) => { const inputValue = event.target.value; if (!inputValue) return; const isDecimalAllowed = ['temperature', 'weight'].includes(modelKey); const regex = isDecimalAllowed ? /^\d*\.?\d+$/ : /^\d+$/; if (regex.test(inputValue)) { if (newVitalSign[modelKey] !== inputValue) { newVitalSign[modelKey] = inputValue; if (modelKey === 'height' || modelKey === 'weight') { calculateBMI(); } playSelectionSound(); } } else { event.target.value = newVitalSign[modelKey] || ''; $q.notify({ type: 'negative', message: `ค่าที่ป้อนสำหรับ ${modelKey} ไม่ถูกต้อง`, position: 'top', timeout: 2000 }); } };
const bmiInterpretation = computed(() => { const bmi = parseFloat(newVitalSign.bmi); if (!bmi || bmi <= 0) return null; if (bmi < 18.5) return { title: 'น้ำหนักน้อย / ผอม', text: 'ควรเพิ่มการบริโภคอาหารที่มีประโยชน์', styleClass: 'bmi-banner-underweight', icon: 'sentiment_dissatisfied' }; if (bmi <= 24.9) return { title: 'น้ำหนักปกติ', text: 'อยู่ในเกณฑ์ดี', styleClass: 'bmi-banner-normal', icon: 'check_circle' }; if (bmi <= 29.9) return { title: 'น้ำหนักเกิน (ท้วม)', text: 'ควรปรับพฤติกรรมการทานอาหารและเริ่มออกกำลังกาย', styleClass: 'bmi-banner-overweight', icon: 'warning' }; if (bmi <= 35.0) return { title: 'อ้วนระดับ 1 (อันตราย)', text: 'เสี่ยงต่อการเกิดโรคร้ายแรง ควรปรับพฤติกรรม', styleClass: 'bmi-banner-obese1', icon: 'error' }; return { title: 'อ้วนระดับ 2 (อันตรายมาก)', text: 'มีความเสี่ยงสูงต่อการเกิดโรคร้ายแรง ควรปรึกษาแพทย์', styleClass: 'bmi-banner-obese2', icon: 'dangerous' }; });
const requiredFields = { 'อุณหภูมิ': computed(() => newVitalSign.temperature), 'ชีพจร': computed(() => newVitalSign.pulse), 'การหายใจ': computed(() => newVitalSign.breathing), 'ความดัน (Systolic)': computed(() => newVitalSign.bloodPressureSystolic), 'ความดัน (Diastolic)': computed(() => newVitalSign.bloodPressureDiastolic), 'อาการสำคัญ': computed(() => chiefComplaintNames.value.length > 0), };
const formProgress = computed(() => { if (!patientInfo.value.id) return 0; const totalFields = Object.keys(requiredFields).length; let filledFields = 0; for (const key in requiredFields) { if (requiredFields[key].value) { filledFields++; } } return totalFields > 0 ? filledFields / totalFields : 0; });
const validateForm = () => { const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key].value); if (missingFields.length > 0) { $q.notify({ type: 'negative', icon: 'warning', message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน', caption: `ยังไม่ได้กรอก: ${missingFields.join(', ')}`, position: 'top', timeout: 5000 }); return false; } return true; };
const getGenderFromPrefix = (prefix) => { if (!prefix) return '-'; if (['นาย', 'เด็กชาย'].includes(prefix)) return 'ชาย'; if (['นาง', 'นางสาว', 'เด็กหญิง'].includes(prefix)) return 'หญิง'; return '-'; };

onMounted(async () => {
  const fetchDoctors = async () => {
    try {
        // 🔥 ดึงข้อมูลหมอจาก API
        const response = await axios.get('https://emr-backend-api-8euv.onrender.com/api/doctors');
        allDoctors.value = response.data.map(doctor => {
            return { id: doctor.id, name: doctor.name, department: doctor.department };
        }); // ✅ ปิดวงเล็บ map ตรงนี้
    } catch (error) {
        console.error("Error:", error);
        $q.notify({ type: 'negative', message: 'ไม่สามารถโหลดรายชื่อแพทย์ได้', icon: 'error' });
    }
  };

  await fetchDoctors();

  const fetchSymptoms = async () => {
      try {
          const response = await axios.get('https://emr-backend-api-8euv.onrender.com/api/masterdata/symptoms');
          masterSymptomList.value = response.data.map(symptom => ({ name: symptom.symptom_name }));
          symptomOptions.value = [...masterSymptomList.value];
      } catch (error) {
          console.error("Error:", error);
          $q.notify({ type: 'warning', message: 'ไม่สามารถโหลดข้อมูล "อาการ" ได้', icon: 'warning' });
      }
  };

  await Promise.all([fetchAllPatients(), fetchMasterData(), fetchSymptoms()]);

  const visitIdToLoad = route.query.visitId;
  const patientDbIdToLoad = route.query.patientId;
  if (visitIdToLoad && patientDbIdToLoad) {
      loadExistingVisitData(visitIdToLoad, patientDbIdToLoad);
  }

  // 👇👇👇 3. โค้ดเช็ก Guide Modal อยู่ล่างสุดของ onMounted แบบนี้ครับ 👇👇👇
  const hasSeenGuide = localStorage.getItem('hasSeenNurseTriageGuide');
  if (!hasSeenGuide) {
      setTimeout(() => {
          showGuideModal.value = true;
      }, 1000);
  }
  // 👆👆👆 สิ้นสุดโค้ดเช็ก Guide 👆👆👆
});
const fetchAllPatients = async () => {
  try {
    const response = await axios.get('https://emr-backend-api-8euv.onrender.com/api/patients');
    let rawPatientData = [];
    if (Array.isArray(response.data)) { rawPatientData = response.data; } else if (response.data && Array.isArray(response.data.result)) { rawPatientData = response.data.result; }
    const formattedPatientData = rawPatientData.map(p => {
        const birthDate = p.birth_date ? new Date(p.birth_date) : null;
        const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : null;
        return {
            id: p.id, prefix: p.prefix, firstName: p.first_name, lastName: p.last_name, patientId: p.patient_id,
            age: age, underlyingDiseases: p.underlying_diseases || 'ไม่มี', drugAllergies: p.allergies || 'ไม่มี',
            foodAllergies: p.food_allergic || p.food_allergies || 'ไม่มี',
            avatarUrl: p.avatar_url
        };
    });
    allPatients.value = formattedPatientData;
    masterPatientIdOptions.value = formattedPatientData.map(p => ({ label: p.patientId, value: p.patientId.toUpperCase() }));
    masterPatientNameOptions.value = formattedPatientData.map(p => ({ label: `${p.prefix || ''}${p.firstName} ${p.lastName}`, value: p.patientId.toUpperCase() }));
    patientIdOptions.value = [...masterPatientIdOptions.value];
    patientNameOptions.value = [...masterPatientNameOptions.value];
  } catch (error) { console.error('Error:', error); $q.notify({ type: 'negative', message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลผู้ป่วยได้', icon: 'signal_wifi_off', position: 'top' }); }
};
const fetchMasterData = async () => { try { const [servicesRes, proceduresRes] = await Promise.all([ axios.get('https://emr-backend-api-8euv.onrender.com/api/masterdata/services'), axios.get('https://emr-backend-api-8euv.onrender.com/api/masterdata/procedures') ]); serviceOptions.value = servicesRes.data.map(item => item.service_name); originalProcedureOptions.value = proceduresRes.data.map(item => item.procedure_name); procedureOptions.value = [...originalProcedureOptions.value]; } catch (error) { console.error("Error:", error); $q.notify({ type: 'warning', message: 'ไม่สามารถโหลดข้อมูลหัตถการ/วินิจฉัยได้', icon: 'warning', position: 'top' }); } };
const loadExistingVisitData = async (visitId, patientDbId) => {
    $q.loading.show({ message: 'กำลังโหลดข้อมูลการรักษา...' });
    try {
        currentVisitId.value = visitId;
        const response = await axios.get(`https://emr-backend-api-8euv.onrender.com/api/visits/details/${visitId}`);
        const fullData = response.data;

        if (!fullData || !fullData.visit) {
            throw new Error('Visit data not found');
        }

        visitStatus.value = fullData.visit.status;

        // --- 1. ข้อมูลผู้ป่วย (Patient Info) ---
        const p = fullData.patientInfo;
        if (p) {
            patientInfo.value = {
                id: p.id,
                name: p.name || `${p.first_name} ${p.last_name}`,
                patientId: p.patientId || p.patient_id || p.hn,
                age: p.age,
                gender: (p.gender === 'ชาย' || p.gender === 'M') ? 'ชาย' : 'หญิง',
                drugAllergies: p.allergies || p.drug_allergies || 'ไม่มี',
                foodAllergies: p.food_allergic || p.food_allergies || 'ไม่มี',
                underlyingDiseases: p.underlyingDisease || p.underlying_diseases || 'ไม่มี',
                avatarUrl: p.avatar_url || null
            };

            if (patientInfo.value.patientId) {
                const patientStringId = patientInfo.value.patientId.toUpperCase();
                selectedPatientIdObject.value = masterPatientIdOptions.value.find(opt => opt.value === patientStringId);
                selectedPatientNameObject.value = masterPatientNameOptions.value.find(opt => opt.value === patientStringId);
            }
        }

        // --- 2. สัญญาณชีพ ---
        const vitals = fullData.vitalSigns;
        if (vitals) {
            Object.assign(newVitalSign, {
                temperature: vitals.temperature,
                pulse: vitals.pulse,
                breathing: vitals.respiration,
                oxygenSaturation: vitals.oxygen_saturation,
                bloodPressureSystolic: vitals.blood_pressure_systolic,
                bloodPressureDiastolic: vitals.blood_pressure_diastolic,
                height: vitals.height,
                weight: vitals.weight,
                waist: vitals.waist_circumference
            });
            calculateBMI();
        }

        // --- 3. อาการ (Symptoms) ---
        const symptomsData = fullData.symptoms || {};
        if (Object.keys(symptomsData).length > 0 || fullData.visit.present_illness) {
            symptomRecordExists.value = true;

            if (symptomsData.chiefComplaints && symptomsData.chiefComplaints.length > 0) {
                symptomDetails.value = symptomsData.chiefComplaints.map(s => ({
                    name: s.name,
                    duration: s.duration || '',
                    level: s.level || 'pain',
                    locations: s.locations || []
                }));
            }
            presentIllness.value = symptomsData.PresentIllness || fullData.visit.present_illness || '';

            const rosSource = symptomsData.reviewOfSystems || fullData.visit || symptomsData;
            const parseROS = (val) => {
                if (!val) return [];
                if (Array.isArray(val)) return val;
                if (typeof val === 'string' && val.trim() !== '') {
                    try { return JSON.parse(val); } catch (e) { return val.split(','); }
                }
                return [];
            };
            reviewOfSystems.value.general = parseROS(rosSource.general || rosSource.ros_general);
            reviewOfSystems.value.headAndNeck = parseROS(rosSource.headAndNeck || rosSource.ros_head_and_neck);
            reviewOfSystems.value.respiratory = parseROS(rosSource.respiratory || rosSource.ros_respiratory);
            reviewOfSystems.value.cardiovascular = parseROS(rosSource.cardiovascular || rosSource.ros_cardiovascular);
            reviewOfSystems.value.gastrointestinal = parseROS(rosSource.gastrointestinal || rosSource.ros_gastrointestinal);
            reviewOfSystems.value.skin = parseROS(rosSource.skin || rosSource.ros_skin);

            await nextTick();
        }

        // --- 4. การรักษา (Procedures) ---
        const proceduresArray = fullData.procedures;
        if (proceduresArray && proceduresArray.length > 0) {
            procedures.value = proceduresArray.map(vp => ({
                service: vp.service ? (vp.service.service_name || vp.service.name) : '-',
                procedure: vp.procedure ? (vp.procedure.procedure_name || vp.procedure.name) : '-',
                notes: vp.notes || ''
            }));
            procedureRecordExists.value = true;
        } else {
            procedures.value = [];
        }

        // --- 5. Referral (เชื่อมกับหมอจริง) ---
        const visitObj = fullData.visit;
        if (visitObj.referral_department && visitObj.referral_department.trim() !== '') {
            referralChoice.value = 'refer';
            selectedDepartment.value = visitObj.referral_department;
            await nextTick();
            // ถ้ามี doctor ID ให้หาจาก list หมอที่โหลดมา
            if(visitObj.referral_doctor) {
                 const doc = allDoctors.value.find(d => d.id == visitObj.referral_doctor);
                 if(doc) {
                     selectedDoctor.value = { value: doc.id, label: doc.name };
                 }
            }
        } else {
            referralChoice.value = 'no_referral';
        }
        referralNotes.value = visitObj.referral_notes || '';

        $q.notify({ type: 'positive', icon: 'done_all', message: `โหลดข้อมูล Visit ID: ${visitId} สำเร็จ` });

    } catch (error) {
        console.error('Error in loadExistingVisitData:', error);
        $q.notify({ type: 'negative', message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล', caption: error.message });
    } finally {
        $q.loading.hide();
    }
};
const painLevelLabel = {
  'irritation': 'ระคายเคือง',
  'pain': 'ปวด',
  'injury': 'บาดเจ็บ'
};
const getMySqlDateTime = () => { const now = new Date(); const date = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)); return date.toISOString().slice(0, 19).replace('T', ' '); };
const createNewVisitForPatient = async (patientStringId) => {
    if (!patientStringId) return;
    $q.loading.show({ message: 'กำลังสร้าง Visit ใหม่...' });
    try {
        // 🔥 ตรวจสอบการส่ง ID พยาบาล (UserID) ให้ถูกต้องจาก Store
        const visitPayload = {
            patient_id: patientStringId,
            UserID: authStore.userId, // ✅ ใช้ ID พยาบาลจาก Store
            visit_datetime: getLocalMySqlDateTime(),
        };

        const response = await axios.post('https://emr-backend-api-8euv.onrender.com/api/visits', visitPayload);
        currentVisitId.value = response.data.visitId;

        $q.notify({
            type: 'info',
            message: `เริ่มการบันทึกสำหรับ Visit ID: ${currentVisitId.value}`,
            position: 'bottom-right'
        });
    } catch (error) {
        console.error('Error:', error);
        $q.notify({ type: 'negative', message: 'เกิดข้อผิดพลาดในการสร้าง Visit ใหม่' });
        currentVisitId.value = null;
    } finally {
        $q.loading.hide();
    }
};
const deleteAbandonedVisit = async (visitId) => { if (!visitId) return; try { console.log(`(Auto-cleanup) Deleting abandoned visit ID: ${visitId}`); await axios.delete(`https://emr-backend-api-8euv.onrender.com/api/visits/${visitId}`); } catch (error) { console.error(`(Auto-cleanup) Failed to delete abandoned visit ${visitId}:`, error); } };
const clearFormFields = () => { patientInfo.value = { id: '', name: '', patientId: '', gender: '', age: null, drugAllergies: '', underlyingDiseases: '' }; selectedPatientIdObject.value = null; selectedPatientNameObject.value = null; currentVisitId.value = null; visitStatus.value = null; symptomRecordExists.value = false; procedureRecordExists.value = false; Object.assign(newVitalSign, { temperature: null, pulse: null, breathing: null, bloodPressureSystolic: null, bloodPressureDiastolic: null, oxygenSaturation: null, waist: null, height: null, weight: null, bmi: '' }); symptomDetails.value = []; presentIllness.value = ''; procedures.value = []; referralChoice.value = 'refer'; selectedDepartment.value = null; selectedDoctor.value = null; referralNotes.value = ''; };
const handlePatientSelection = async (selectedOption) => { if (isEditMode.value) return; const oldVisitId = currentVisitId.value; if (!selectedOption) { clearFormFields(); selectedPatientIdObject.value = null; selectedPatientNameObject.value = null; await deleteAbandonedVisit(oldVisitId); playRemoveSound(); return; } const newPatientStringId = selectedOption.value.toUpperCase(); if (patientInfo.value.patientId && patientInfo.value.patientId.toUpperCase() === newPatientStringId) { return; } const foundPatient = allPatients.value.find(p => p.patientId.toUpperCase() === newPatientStringId); if (foundPatient) { clearFormFields(); patientInfo.value = { id: foundPatient.id, name: `${foundPatient.prefix || ''}${foundPatient.firstName} ${foundPatient.lastName}`, patientId: foundPatient.patientId, age: foundPatient.age, gender: getGenderFromPrefix(foundPatient.prefix), drugAllergies: foundPatient.drugAllergies || 'ไม่มี', foodAllergies: foundPatient.foodAllergies || 'ไม่มี', underlyingDiseases: foundPatient.underlyingDiseases || 'ไม่มี', avatarUrl: foundPatient.avatarUrl }; const idOption = masterPatientIdOptions.value.find(opt => opt.value === newPatientStringId); const nameOption = masterPatientNameOptions.value.find(opt => opt.value === newPatientStringId); selectedPatientIdObject.value = idOption; selectedPatientNameObject.value = nameOption; await createNewVisitForPatient(foundPatient.patientId); await deleteAbandonedVisit(oldVisitId); } };
const clearForm = () => { if (isEditMode.value) { router.push({ name: 'NursePatientList' }); } playRemoveSound(); patientInfo.value = { id: '', name: '', patientId: '', gender: '', age: null, drugAllergies: '', foodAllergies: '', underlyingDiseases: '' }; selectedPatientIdObject.value = null; selectedPatientNameObject.value = null; currentVisitId.value = null; Object.assign(newVitalSign, { temperature: null, pulse: null, breathing: null, bloodPressureSystolic: null, bloodPressureDiastolic: null, oxygenSaturation: null, waist: null, height: null, weight: null, bmi: '' }); symptomDetails.value = []; presentIllness.value = ''; Object.assign(reviewOfSystems.value, { general: [], headAndNeck: [], respiratory: [], cardiovascular: [], gastrointestinal: [], skin: [] }); procedures.value = []; Object.assign(newProcedureItem, { service: null, procedure: null, notes: '' }); referralChoice.value = 'refer'; selectedDepartment.value = null; selectedDoctor.value = null; referralNotes.value = ''; };
const filterPatientId = (val, update) => { update(() => { patientIdOptions.value = !val ? masterPatientIdOptions.value : masterPatientIdOptions.value.filter(v => v.label.toLowerCase().includes(val.toLowerCase())); }); };
const filterPatientName = (val, update) => { update(() => { patientNameOptions.value = !val ? masterPatientNameOptions.value : masterPatientNameOptions.value.filter(v => v.label.toLowerCase().includes(val.toLowerCase())); }); };
const filterProcedure = (val, update) => { update(() => { procedureOptions.value = !val ? originalProcedureOptions.value : originalProcedureOptions.value.filter(v => v.toLowerCase().includes(val.toLowerCase())); }); };
const toggleHistory = () => { showHistory.value = !showHistory.value; playClickSound(); };
const performSave = async (statusToSave = null) => {
  if (!currentVisitId.value || !patientInfo.value.id) {
    $q.notify({ type: 'negative', message: 'กรุณาเลือกผู้ป่วยก่อน', icon: 'error', position: 'top' });
    return false;
  }

  // 1. เตรียมข้อมูล Vitals
  const vitalSignsPayload = {
    temperature: newVitalSign.temperature ? parseFloat(newVitalSign.temperature) : null,
    pulse: newVitalSign.pulse ? parseInt(newVitalSign.pulse, 10) : null,
    respiration: newVitalSign.breathing ? parseInt(newVitalSign.breathing, 10) : null,
    oxygen_saturation: newVitalSign.oxygenSaturation ? parseInt(newVitalSign.oxygenSaturation, 10) : null,
    blood_pressure_systolic: newVitalSign.bloodPressureSystolic ? parseInt(newVitalSign.bloodPressureSystolic, 10) : null,
    blood_pressure_diastolic: newVitalSign.bloodPressureDiastolic ? parseInt(newVitalSign.bloodPressureDiastolic, 10) : null,
    height: newVitalSign.height ? parseFloat(newVitalSign.height) : null,
    weight: newVitalSign.weight ? parseFloat(newVitalSign.weight) : null,
    waist_circumference: newVitalSign.waist ? parseInt(newVitalSign.waist, 10) : null,
    bmi: newVitalSign.bmi ? parseFloat(newVitalSign.bmi) : null,
  };

  // 2. เตรียมข้อมูล Referral + ID พยาบาล
  const referralPayload = {
      referral_department: referralChoice.value === 'refer' ? selectedDepartment.value : null,
      referral_doctor: referralChoice.value === 'refer' ? selectedDoctor.value?.value : null,
      referral_notes: referralNotes.value,
      nurse_id: authStore.userId // ✅ ส่ง ID พยาบาล
  };

  const combinedPayload = { ...vitalSignsPayload, ...referralPayload };
  if (statusToSave) { combinedPayload.status = statusToSave; }

  const finalVisitPayload = Object.fromEntries( Object.entries(combinedPayload).filter(([_, v]) => v !== undefined) );
  const apiCalls = [];

  // --- ส่งคำขอที่ 1: ข้อมูล Visit หลัก & Vitals ---
  if (Object.keys(finalVisitPayload).length > 0) {
    apiCalls.push(axios.put(`https://emr-backend-api-8euv.onrender.com/api/visits/${currentVisitId.value}`, finalVisitPayload));
  }

  // 3. เตรียมข้อมูล Symptoms (ซักประวัติ)
  const symptomsData = [];
  const summaryData = {
    ChiefComplaint: null,
    PresentIllness: presentIllness.value,
    ROS_General: reviewOfSystems.value.general,
    ROS_HeadAndNeck: reviewOfSystems.value.headAndNeck,
    ROS_Respiratory: reviewOfSystems.value.respiratory,
    ROS_Cardiovascular: reviewOfSystems.value.cardiovascular,
    ROS_Gastrointestinal: reviewOfSystems.value.gastrointestinal,
    ROS_Skin: reviewOfSystems.value.skin,
  };

  if (summaryData.PresentIllness || Object.values(reviewOfSystems.value).some(arr => arr.length > 0)) {
    symptomsData.push(summaryData);
  }

  symptomDetails.value.forEach(symptom => {
    symptomsData.push({ ChiefComplaint: symptom.name, duration: symptom.duration, level: symptom.level,locations: symptom.locations });
  });

  // 🔥 จุดสำคัญ: ห่อ Symptoms ด้วย Object เพื่อส่ง nurse_id ไปด้วย
  if (symptomsData.length > 0) {
    const method = symptomRecordExists.value ? 'put' : 'post';
    const wrappedSymptoms = {
      symptoms: symptomsData,
      nurse_id: authStore.userId // ✅ ส่ง ID พยาบาลไปกำกับ
    };
    apiCalls.push(axios[method](`https://emr-backend-api-8euv.onrender.com/api/visits/${currentVisitId.value}/symptoms`, wrappedSymptoms));
  }

  // 4. เตรียมข้อมูล Procedures (การรักษา)
  // 🔥 จุดสำคัญ: แยกหมวดหมู่ให้ตรงกับที่ Backend คาดหวัง
  const servicesList = procedures.value.filter(p => p.service !== '-').map(p => ({ name: p.service }));
  const proceduresList = procedures.value.filter(p => p.procedure !== '-').map(p => ({ name: p.procedure }));

  if (servicesList.length > 0 || proceduresList.length > 0) {
    const procedureMethod = procedureRecordExists.value ? 'put' : 'post';
    const wrappedProcedures = {
      services: servicesList,
      procedures: proceduresList,
      diagnoses: [], // พยาบาลยังไม่ได้วินิจฉัยโรค
      nurse_id: authStore.userId // ✅ ส่ง ID พยาบาลไปกำกับ
    };
    apiCalls.push(axios[procedureMethod](`https://emr-backend-api-8euv.onrender.com/api/visits/${currentVisitId.value}/procedures`, wrappedProcedures));
  }

  // --- ประมวลผลการบันทึกทั้งหมด ---
  if (apiCalls.length === 0) {
    $q.notify({ type: 'info', message: 'ไม่มีข้อมูลใหม่ให้บันทึก', icon: 'info', position: 'top' });
    return false;
  }

  try {
    await Promise.all(apiCalls);
    return true;
  } catch (error) {
    console.error('Error:', error);
    $q.notify({
        type: 'negative',
        message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        caption: error.response?.data?.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
        icon: 'error',
        position: 'top'
    });
    return false;
  }
};
const confirmAndSaveDraft = () => { if (formProgress.value === 1) { saveDraftData(); return; } $q.dialog({ title: 'ยืนยันการบันทึกฉบับร่าง', message: 'ข้อมูลสำคัญยังกรอกไม่ครบถ้วน คุณต้องการบันทึกฉบับร่างต่อไปใช่หรือไม่?', cancel: true, persistent: true, ok: { label: 'บันทึก', color: 'cyan-6', unelevated: true }, cancel: { label: 'ยกเลิก', color: 'grey', flat: true }, dark: true, class: 'glass-panel' }).onOk(() => { saveDraftData(); }); };
const saveDraftData = async () => { $q.loading.show({ message: 'กำลังบันทึกฉบับร่าง...' }); const success = await performSave(); $q.loading.hide(); if (success) { $q.notify({ type: 'info', message: 'บันทึกข้อมูลฉบับร่างสำเร็จ', icon: 'save', position: 'top' }); setTimeout(() => { router.push({ name: 'NursePatientList', query: { newVisitId: currentVisitId.value } }); }, 1000); } };
const completeTreatment = () => { if (!validateForm()) { return; } $q.dialog({ title: 'ยืนยันการส่งต่อเคส', message: 'คุณต้องการบันทึกและส่งต่อเคสนี้ให้แพทย์ใช่หรือไม่? (สถานะจะเปลี่ยนเป็น "รอพบแพทย์")', cancel: true, persistent: true, ok: { label: 'ยืนยันและส่งต่อ', color: 'cyan-6', unelevated: true }, cancel: { label: 'ยกเลิก', color: 'grey', flat: true }, dark: true, class: 'glass-panel' }).onOk(async () => { $q.loading.show({ message: 'กำลังส่งต่อเคสให้แพทย์...' }); const success = await performSave('รอพบแพทย์'); if (success) { $q.loading.hide(); $q.notify({ type: 'positive', message: 'ส่งเคสให้แพทย์สำเร็จ!', icon: 'check_circle', position: 'top' }); setTimeout(() => { router.push({ name: 'NursePatientList', query: { newVisitId: currentVisitId.value } }); }, 1500); } else { $q.loading.hide(); } }); };
const calculateBMI = () => { const height = parseFloat(newVitalSign.height); const weight = parseFloat(newVitalSign.weight); if (height > 0 && weight > 0) { newVitalSign.bmi = (weight / ((height / 100) ** 2)).toFixed(2); } else { newVitalSign.bmi = ''; } };
const addProcedure = () => { if (newProcedureItem.service) { if (newProcedureItem.service === '-') { newProcedureItem.procedure = '-'; } procedures.value.push({ ...newProcedureItem }); Object.assign(newProcedureItem, { service: null, procedure: null, notes: '' }); playClickSound(); } };
const addDeclinedProcedure = () => { procedures.value.push({ service: 'ไม่รับการรักษา', procedure: '-', notes: newProcedureItem.notes || 'ผู้ป่วยปฏิเสธการรับบริการ' }); Object.assign(newProcedureItem, { service: null, procedure: null, notes: '' }); playClickSound(); };
const removeProcedure = (index) => { procedures.value.splice(index, 1); playRemoveSound(); };

const openCertificateDialog = () => {
  if (!patientInfo.value.id) return;
  playClickSound();

  // เตรียมข้อมูล
  certificateData.patientName = patientInfo.value.name;
  certificateData.patientIdCard = patientInfo.value.patientId; // Mock หรือดึงจริงถ้ามี
  certificateData.patientAge = patientInfo.value.age || '-';
  certificateData.patientAddress = 'บ้านเลขที่ 99 หมู่ 1 ต.สำราญ อ.เมือง จ.ขอนแก่น'; // Mock

  // ดึง Vital Signs ล่าสุด
  certificateData.vitals = {
    weight: newVitalSign.weight,
    height: newVitalSign.height,
    temperature: newVitalSign.temperature,
    pulse: newVitalSign.pulse,
    bp: `${newVitalSign.bloodPressureSystolic || '-'}/${newVitalSign.bloodPressureDiastolic || '-'}`
  };

  // ดึงความเห็นแพทย์ (ถ้ามี) หรืออาการเบื้องต้น
  const complaints = chiefComplaintNames.value.join(', ');
  certificateData.diagnosis = complaints ? `ผู้ป่วยมาด้วยอาการ: ${complaints}` : '-';
  certificateData.opinion = patientInfo.value.underlyingDiseases !== 'ไม่มี'
    ? `มีโรคประจำตัว: ${patientInfo.value.underlyingDiseases}`
    : 'สุขภาพทั่วไปแข็งแรงดี';

  showCertificateDialog.value = true;
};
</script>
<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');

/* --- THEME VARIABLES --- */
$dark-bg: #0f172a;
$glass-bg: rgba(30, 41, 59, 0.7);
$border: 1px solid rgba(255, 255, 255, 0.08);
$cyan: #22d3ee;

.dashboard-background {
  background: $dark-bg;
  font-family: 'Sarabun';
  color: #e2e8f0;
}

.content-wrapper {
  position: relative;
  z-index: 2;
  padding-bottom: 80px;
  width: 100%;
}

/* --- GLASS PANEL --- */
.glass-panel {
  background: $glass-bg;
  backdrop-filter: blur(12px);
  border: $border;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

/* --- FLAT UI COMPONENTS --- */
.icon-box-flat {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, $cyan, #0ea5e9);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

/* Inputs */
.flat-input :deep(.q-field__control) {
  background: rgba(0,0,0,0.2) !important;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  transition: border-color 0.3s;
}
.flat-input :deep(.q-field__control:hover) {
  border-color: $cyan;
}
.flat-input :deep(.q-field--focused .q-field__control) {
  border-color: $cyan !important;
  background: rgba(0,0,0,0.3) !important;
}

/* Section Header */
.section-header {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
  padding-bottom: 12px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
}
.section-header .q-icon {
  font-size: 1.8rem;
  margin-right: 12px;
  color: $cyan;
}

/* Buttons */
.positive-action-btn, .negative-action-btn, .choice-btn, .primary-action-btn, .save-btn, .cert-btn {
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s;
  box-shadow: none;
}
.positive-action-btn { background: #0ea5e9; color: white; }
.negative-action-btn { background: #ef4444; color: white; }
.choice-btn {
  background: rgba(255,255,255,0.05);
  color: #94a3b8;
  border: 1px solid rgba(255,255,255,0.1);
}
.choice-btn--active-positive { background: #0ea5e9; color: white; border-color: #0ea5e9; }
.choice-btn--active-negative { background: #ef4444; color: white; border-color: #ef4444; }
.primary-action-btn { background: #0ea5e9; color: white; }
.save-btn { background: #10b981; color: white; }
.cert-btn { background: #f97316; color: white; }

.positive-action-btn:hover, .negative-action-btn:hover, .primary-action-btn:hover, .save-btn:hover, .cert-btn:hover {
  transform: translateY(-2px);
}

/* Patient Details */
.patient-details-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
}
.bg-gradient-primary { background: linear-gradient(135deg, $cyan, #0ea5e9); }

/* Body Model 3D & Tooltips */
.body-model-wrapper {
  border-radius: 12px;
  background-color: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.05);
  position: relative;
  overflow: hidden;

  /* 🔥 แก้ไข: ปรับขนาดให้พอดี ไม่ใหญ่เกินไป */
  height: 650px;        /* ลดความสูงลงจาก 500px เหลือ 400px */
  max-width: 1500px;     /* จำกัดความกว้างไม่ให้เต็มจอ */
  width: 100%;          /* ยืดหยุ่นในจอเล็ก */
  margin: 0 auto;       /* จัดกึ่งกลางหน้าจอ */

  perspective: 1000px;
  cursor: crosshair;
}

/* 🔥 เพิ่ม: บังคับให้ SVG อยู่ในกรอบสวยๆ */
.body-face svg {
  height: 100%;
  width: 100%;
  display: block;
}

.body-flip-container {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.body-flip-container.is-flipped { transform: rotateY(180deg); }

.body-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.body-back { transform: rotateY(180deg); }

.body-part {
  fill: rgba(255,255,255,0.1);
  stroke: rgba(255,255,255,0.3);
  stroke-width: 2;
  transition: all 0.2s;
  cursor: pointer;
}
.body-part:hover {
  stroke: $cyan;
  fill: rgba(34, 211, 238, 0.3);
  filter: drop-shadow(0 0 8px $cyan);
}

/* Floating Tooltip */
.floating-tooltip {
  position: fixed;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.8);
  color: $cyan;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  pointer-events: none;
  border: 1px solid rgba(34, 211, 238, 0.3);
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  transform: translate(0, 0);
}

/* --- Pain Levels & Animations (Updated Colors) --- */

/* 🔴 ระดับ 3: บาดเจ็บ (Injury) -> สีแดงสด */
.pain--injury {
  fill: #ef4444 !important;      /* สีแดงพื้นหลัง */
  stroke: #b91c1c !important;    /* สีขอบแดงเข้ม */
  stroke-width: 3px !important;
  filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.8)); /* เงาแดงฟุ้ง */
  animation: pulse-red 1s infinite alternate; /* กระพริบเร็ว */
}

/* 🟠 ระดับ 2: ปวด (Pain) -> สีส้ม */
.pain--pain {
  fill: #f97316 !important;
  stroke: #c2410c !important;
  filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.6));
  animation: pulse-orange 2s infinite alternate;
}

/* 🟡 ระดับ 1: ระคายเคือง (Irritation) -> สีเหลือง */
.pain--irritation {
  fill: #eab308 !important;
  stroke: #a16207 !important;
  filter: drop-shadow(0 0 5px rgba(234, 179, 8, 0.5));
  animation: pulse-yellow 3s infinite alternate;
}

/* Keyframes สำหรับการกระพริบ */
@keyframes pulse-red {
  from { fill-opacity: 0.7; stroke-width: 2px; }
  to { fill-opacity: 1; stroke-width: 4px; transform: scale(1.02); }
}
@keyframes pulse-orange {
  from { fill-opacity: 0.6; }
  to { fill-opacity: 0.9; }
}
@keyframes pulse-yellow {
  from { fill-opacity: 0.5; }
  to { fill-opacity: 0.8; }
}

/* Badge Colors ในรายการ */
.pain-badge--injury { background: #ef4444; color: white; border: 1px solid #b91c1c; }
.pain-badge--pain { background: #f97316; color: white; border: 1px solid #c2410c; }
.pain-badge--irritation { background: #eab308; color: black; border: 1px solid #a16207; }

/* Lists */
.themed-list {
  background: rgba(0,0,0,0.1);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.05);
}

/* Footer */
.action-footer {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255,255,255,0.1);
}

/* Animation */
.list-item-animation {
  opacity: 0;
  animation: fadeInSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeInSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Utility */
.bg-white-05 { background: rgba(255,255,255,0.05); }
.form-disabled { opacity: 0.5; pointer-events: none; filter: grayscale(50%); }

/* Avatar & Zoom Effect */
.avatar-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  width: 80px;
  height: 80px;
  display: inline-block;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}
.zoom-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 50%;
}
.avatar-wrapper:hover .avatar-img { transform: scale(1.1); }
.avatar-wrapper:hover .zoom-overlay { opacity: 1; }
.text-shadow { text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
</style>

