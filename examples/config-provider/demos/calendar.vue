<template>
  <t-config-provider :global-config="globalConfig" style="padding: 16px">
    <t-calendar></t-calendar>
  </t-config-provider>
</template>

<script setup>
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const globalConfig = {
  calendar: {
    yearSelection: '{year}',
    // 1 表示周一；7 表示周日
    firstDayOfWeek: 7,
    monthSelection: ({ month }) => MONTHS[month - 1],
    yearRadio: 'Year',
    monthRadio: 'Month',
    hideWeekend: 'Hide Weekend',
    showWeekend: 'Show Weekend',
    today: 'Today',
    thisMonth: 'This Month',
    week: ['Monday', 'Tuesday', 'Wedsday', 'Thuresday', 'Friday', 'Staturday', 'Sunday'].join(),
    cellMonth: MONTHS.join(),
    fillWithZero: false,
    controllerConfig: {
      year: {
        visible: true,
        selecteProps: {
          size: 'small',
        },
      },
      month: {
        visible: true,
        selecteProps: {
          size: 'small',
        },
      },
      mode: {
        visible: true,
        radioGroupProps: {
          size: 'small',
        },
      },
      weekend: {
        visible: true,
        showWeekendButtonProps: {
          size: 'small',
        },
        hideWeekendButtonProps: {
          size: 'small',
        },
      },
      current: {
        visible: true,
        currentDayButtonProps: {
          theme: 'warning',
          size: 'small',
        },
        currentMonthButtonProps: {
          theme: 'success',
          size: 'small',
        },
      },
    },
  },
};
</script>

<style scoped>
.tdesign-demo-item--locale-provider-base {
  margin: 24px -120px 0 0;
}
</style>
