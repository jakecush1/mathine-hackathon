<!-- FormSelect.vue -->
<template>
  <div class="form-group" :class="groupClasses">
    <label v-if="label" class="form-label" :for="id || name">{{ label }}</label>

    <select
      class="form-select"
      :class="[{ 'form-select-toggle': otherLabel }, inputClasses]"
      :id="id || name"
      :name="name"
      :multiple="multi"
      @change="onChange($event)"
      ref="selectElement"
      v-bind="$attrs"
    >
      <option v-if="!multi && !noBlank" value="">Choose...</option>

      <option
        v-for="option in options"
        :key="option[optVal]"
        :value="option[optVal]"
        :selected="isOptionSelected(option[optVal])"
      >
        {{ option[optTxt] || option[optVal] }}
      </option>

      <option v-if="otherLabel" value="other">
        {{ otherLabel }}
      </option>
    </select>

    <small v-if="hintText" class="form-text text-muted">
      <span v-html="hintText"></span>
    </small>
  </div>

  <!-- Inline "Other" text input (only when other=true and selected) -->
  <div v-if="other" class="mt-2" :id="`${name}OtherGroup`" v-show="showOther">
    <label class="form-label" :for="`${name}Other`">Other option</label>
    <input
      type="text"
      class="form-control"
      :name="`${name}Other`"
      :id="`${name}Other`"
      :value="selectedOther || ''"
      @input="updateOtherVal(($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";

type OptionLike = Record<string, any>;

const props = defineProps<{
  name: string;
  id?: string;
  label?: string;
  options: OptionLike[];
  modelValue?: string | number | Array<string | number>;
  selectedOther?: string;
  other?: boolean;
  noBlank?: boolean;
  multi?: boolean;
  optVal?: string;
  optTxt?: string;
  hintText?: string;
  // styles
  groupClasses?: string;
  inputClasses?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: string | number | Array<string | number>): void;
  (e: "update:selectedOther", v: string): void;
}>();

const optVal = computed(() => props.optVal ?? "value");
const optTxt = computed(() => props.optTxt ?? "text");

const selectElement = ref<HTMLSelectElement | null>(null);

/** Normalize v-model into an array for comparisons */
const selectedValues = computed<Array<string | number>>(() => {
  const v = props.modelValue;
  if (Array.isArray(v)) return v;
  if (v === null || v === undefined || v === "") return [];
  return [v as string | number];
});

const isOptionSelected = (value: string | number) =>
  selectedValues.value.includes(value);

/** Label for the "Other" option if enabled */
const otherLabel = computed(() =>
  props.other ? "Other (please indicate below)" : ""
);

/** Whether to show the "Other" text input */
const showOther = computed(() => {
  if (!props.other) return false;
  if (props.multi) return selectedValues.value.includes("other");
  return selectedValues.value[0] === "other";
});

/** Emit updated selected value(s) */
function onChange(e: Event) {
  const select = e.target as HTMLSelectElement;
  let newValue: string | number | Array<string | number>;

  if (props.multi) {
    const arr = Array.from(select.selectedOptions).map((o) => o.value);
    newValue = arr.filter((v) => v !== "");
  } else {
    newValue = select.value;
    // keep numeric type if modelValue started numeric
    if (typeof props.modelValue === "number" && newValue !== "") {
      const n = Number(newValue);
      newValue = Number.isNaN(n) ? (newValue as string) : n;
    }
  }

  emit("update:modelValue", newValue);

  // Clear "other" text if "other" is not selected
  const otherChosen = props.multi
    ? (newValue as Array<string | number>).includes("other")
    : newValue === "other";

  if (!otherChosen) {
    emit("update:selectedOther", "");
  }
}

/** Update the "other" text value */
function updateOtherVal(val: string) {
  emit("update:selectedOther", val);
}

/** Keep DOM selection in sync when v-model changes externally */
watch(
  () => props.modelValue,
  async (newValue) => {
    await nextTick();
    const select = selectElement.value;
    if (!select) return;

    // clear current selection
    for (const opt of Array.from(select.options)) opt.selected = false;

    if (props.multi && Array.isArray(newValue)) {
      for (const v of newValue) {
        const opt = select.querySelector(`option[value="${v}"]`) as
          | HTMLOptionElement
          | null;
        if (opt) opt.selected = true;
      }
    } else if (!props.multi && newValue !== undefined && newValue !== null) {
      const opt = select.querySelector(`option[value="${newValue}"]`) as
        | HTMLOptionElement
        | null;
      if (opt) opt.selected = true;
    }
  },
  { immediate: true }
);
</script>
