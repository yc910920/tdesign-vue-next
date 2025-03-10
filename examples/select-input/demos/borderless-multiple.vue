<template>
  <div class="tdesign-demo__select-input-multiple" style="width: 100%">
    <t-select-input
      :value="value"
      :min-collapsed-num="1"
      borderless
      allow-input
      placeholder="select frameworks"
      clearable
      multiple
      @tag-change="onTagChange"
    >
      <template #panel>
        <t-checkbox-group
          :value="checkboxValue"
          :options="options"
          class="tdesign-demo__pannel-options-multiple-borderless"
          @change="onCheckedChange"
        />
      </template>
      <template #suffixIcon>
        <chevron-down-icon />
      </template>
    </t-select-input>
  </div>
</template>
<script>
import { computed, defineComponent, ref } from 'vue';
import { ChevronDownIcon } from 'tdesign-icons-vue-next';

const OPTIONS = [
  // 全选
  { label: 'all frameworks', checkAll: true },
  { label: 'tdesign-vue', value: 1 },
  { label: 'tdesign-react', value: 2 },
  { label: 'tdesign-miniprogram', value: 3 },
  { label: 'tdesign-angular', value: 4 },
  { label: 'tdesign-mobile-vue', value: 5 },
  { label: 'tdesign-mobile-react', value: 6 },
];

export default defineComponent({
  name: 'SelectInputMultipleleBorderless',
  components: { ChevronDownIcon },
  setup() {
    const allowInput = ref(true);
    const creatable = ref(true);
    const options = ref([...OPTIONS]);
    const value = ref([
      { label: 'Vue', value: 1 },
      { label: 'React', value: 2 },
      { label: 'Miniprogram', value: 3 },
    ]);

    const checkboxValue = computed(() => {
      const arr = [];
      const list = value.value;
      // 此处不使用 forEach，减少函数迭代
      for (let i = 0, len = list.length; i < len; i++) {
        list[i].value && arr.push(list[i].value);
      }
      return arr;
    });

    // 直接 checkboxgroup 组件渲染输出下拉选项
    const onCheckedChange = (val, { current, type }) => {
      // current 不存在，则表示操作全选
      if (!current) {
        value.value = type === 'check' ? options.value.slice(1) : [];
        return;
      }
      // 普通操作
      if (type === 'check') {
        const option = options.value.find((t) => t.value === current);
        value.value.push(option);
      } else {
        value.value = value.value.filter((v) => v.value !== current);
      }
    };

    // 可以根据触发来源，自由定制标签变化时的筛选器行为
    const onTagChange = (currentTags, context) => {
      console.log(currentTags, context);
      const { trigger, index, item } = context;
      if (trigger === 'clear') {
        value.value = [];
      }
      if (['tag-remove', 'backspace'].includes(trigger)) {
        value.value.splice(index, 1);
      }
      // 如果允许创建新条目
      if (creatable.value && trigger === 'enter') {
        const current = { label: item, value: item };
        value.value.push(current);
        options.value = options.value.concat(current);
      }
    };

    return {
      value,
      checkboxValue,
      options,
      allowInput,
      creatable,
      onCheckedChange,
      onTagChange,
    };
  },
});
</script>

<style>
.tdesign-demo__pannel-options-multiple-borderless {
  width: 100%;
}
.tdesign-demo__pannel-options-multiple-borderless .t-checkbox {
  display: block;
  margin: 12px;
}
</style>
