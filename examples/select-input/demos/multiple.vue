<template>
  <div class="tdesign-demo__select-input-multiple" style="width: 100%">
    <div>
      <t-checkbox v-model="allowInput">是否允许输入</t-checkbox>
      <t-checkbox v-model="creatable">允许创建新选项（Enter 创建）</t-checkbox>
    </div>
    <br />
    <div>
      <t-radio-group
        v-model="excessTagsDisplayType"
        :options="[
          { label: '选中项过多横向滚动', value: 'scroll' },
          { label: '选中项过多换行显示', value: 'break-line' },
        ]"
      />
    </div>
    <br /><br />

    <!-- :popup-props="{ trigger: 'hover' }" -->
    <t-select-input
      v-model:inputValue="inputValue"
      :value="value"
      :allow-input="allowInput"
      :placeholder="allowInput ? '请选择或输入' : '请选择'"
      :tag-input-props="{ excessTagsDisplayType }"
      :popup-props="{ overlayStyle: { maxHeight: '280px', overflow: 'auto' } }"
      clearable
      multiple
      @tag-change="onTagChange"
      @input-change="onInputChange"
    >
      <template #panel>
        <t-checkbox-group
          v-if="options.length"
          :value="checkboxValue"
          :options="options"
          class="tdesign-demo__pannel-options-multiple"
          @change="onCheckedChange"
        />
        <div v-else class="tdesign-demo__select-empty-multiple">暂无数据</div>
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
  { label: 'Check All', checkAll: true },
  { label: 'tdesign-vue', value: 1 },
  { label: 'tdesign-react', value: 2 },
  { label: 'tdesign-miniprogram', value: 3 },
  { label: 'tdesign-angular', value: 4 },
  { label: 'tdesign-mobile-vue', value: 5 },
  { label: 'tdesign-mobile-react', value: 6 },
];

export default defineComponent({
  name: 'SelectInputMultiple',
  components: { ChevronDownIcon },
  setup() {
    const excessTagsDisplayType = ref('break-line');
    const allowInput = ref(true);
    const creatable = ref(true);
    const inputValue = ref('');
    // 全量数据
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
        const newOptions = options.value.concat(current);
        options.value = newOptions;
        inputValue.value = '';
      }
    };

    const onInputChange = (val, context) => {
      // 过滤功能
      console.log(val, context);
    };

    return {
      value,
      inputValue,
      checkboxValue,
      options,
      allowInput,
      creatable,
      excessTagsDisplayType,
      onCheckedChange,
      onTagChange,
      onInputChange,
    };
  },
});
</script>

<style>
.tdesign-demo__select-empty-multiple {
  text-align: center;
  color: var(--td-text-color-disabled);
  line-height: 32px;
}

.tdesign-demo__pannel-options-multiple {
  width: 100%;
}
.tdesign-demo__pannel-options-multiple .t-checkbox {
  display: block;
  margin: 12px;
}
</style>
