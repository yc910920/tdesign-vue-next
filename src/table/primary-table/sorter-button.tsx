import { defineComponent, PropType, h } from 'vue';
import isFunction from 'lodash/isFunction';
import { ChevronDownIcon } from 'tdesign-icons-vue-next';
import mixins from '../../utils/mixins';
import getConfigReceiverMixins, { TableConfig } from '../../config-provider/config-receiver';
import { SortType } from '../type';
import { prefix } from '../../config';
import Tooltip from '../../tooltip';
import { Styles } from '../../common';

const tooltips = {
  asc: '点击升序',
  desc: '点击降序',
  cancel: '点击取消排序',
};

type SortTypeEnums = Array<'desc' | 'asc'>;

export default defineComponent({
  ...mixins(getConfigReceiverMixins<TableConfig>('table')),
  name: `${prefix}-sorter-button`,
  props: {
    sortType: {
      type: String as PropType<SortType>,
      default: null,
    },
    sortOrder: {
      type: String,
      default: (): string => '',
    },
    nextSortOrder: {
      type: String,
      required: false,
      default: 'cancel',
    },
  },
  emits: ['change'],
  computed: {
    allowSortTypes(): SortTypeEnums {
      return this.sortType === 'all' ? ['asc', 'desc'] : [this.sortType];
    },
  },
  methods: {
    getSortIcon(direction: string, className: string) {
      const icon = isFunction(this.global.sortIcon) ? this.global.sortIcon(h) : <ChevronDownIcon size="16px" />;
      let style: Styles = {
        left: '0px',
      };
      if (direction === 'asc') {
        style = {
          transform: 'rotate(-180deg)',
          top: '-1px',
          ...style,
        };
      } else {
        style.bottom = '-1px';
      }
      const sortClassName = [`${prefix}-table__sort-icon`, className, `${prefix}-table-sort-${direction}`];
      return h(icon, {
        style,
        class: sortClassName,
      });
    },
  },
  render() {
    const { allowSortTypes, sortOrder, nextSortOrder } = this;
    const buttonProps = { class: allowSortTypes.length > 1 ? `${prefix}-table__double-icons` : '' };
    const tips = tooltips[nextSortOrder];
    const sortButton = allowSortTypes.map((direction: string) => {
      const className = direction === sortOrder ? `${prefix}-table__sort-icon--active` : `${prefix}-icon-sort--default`;
      return this.getSortIcon(direction, className);
    });
    return (
      <div class={`${prefix}-table__cell--sort-trigger`} {...buttonProps}>
        {tips ? (
          <Tooltip style="line-height: 0px;position:relative;" content={tips} showArrow={false}>
            {sortButton}
          </Tooltip>
        ) : (
          sortButton
        )}
      </div>
    );
  },
});
