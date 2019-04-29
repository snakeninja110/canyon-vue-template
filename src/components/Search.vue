<template>
    <div class='search'>
        <el-row>
            <el-col :span="9">
                日期&nbsp;
                <el-button plain :size="size" @click="quickDate('before')">前一天</el-button>
                <el-date-picker class="data-picker" v-model="formLabelAlign.date" type="date" placeholder="选择日期" :size="size" clearable></el-date-picker>
                <el-button plain :size="size" @click="quickDate('after')">后一天</el-button>
            </el-col>
            <el-col :span="4">
                名称&nbsp;
                <el-autocomplete
                    class="inline-input"
                    v-model="formLabelAlign.name"
                    :fetch-suggestions="queryStation"
                    placeholder="名称"
                    :size="size"
                    clearable
                    ></el-autocomplete>
            </el-col>
            <el-col :span="4">
                单价&nbsp;
                <el-autocomplete
                    class="inline-input"
                    v-model="formLabelAlign.price"
                    :fetch-suggestions="queryStation"
                    placeholder="单价"
                    :size="size"
                    clearable
                    ></el-autocomplete>
            </el-col>
            <el-col :span="3" class="align-right">
                <el-button class="btn" type="primary" :loading="loading" @click="search" :size="size" native-type="submit">查询</el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { format as formatDate } from '@/project/koi/util/date';

let timer;

export default {
    name: 'Search',
    data() {
        return {
            size: 'medium',
            labelPosition: 'right',
            listData: {
                name: [{value: '例子'}],
            },
            formLabelAlign: {
                date: new Date(),
                name: '',
                price: ''
            },
            loading: false
        }
    },
    watch: {
        'formLabelAlign.date': {
            handler(nv, ov){
                if (nv != ov) {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(() => {
                        this.search();
                    }, 500);
                }
            }
        }
    },
    unicom: {
        're_Search_list'() {
            this.search();
        }
    },
    methods: {
        createFilter(queryString) {
            return (station) => {
                return (station.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
            };
        },
        queryStation(queryString, cb) {
            let names = this.listData.names;
            let results = queryString ? names.filter(this.createFilter(queryString)) : names;
            // 调用 callback 返回建议列表的数据
            cb(results);
        },
        search() {
            this.loading = true;
            let fromDate = formatDate(this.formLabelAlign.date);
            this.$model.item.search(
                {
                    name: this.formLabelAlign.name,
                    price: this.formLabelAlign.price,
                    date: fromDate
                },
                (res) => {
                    // let dateStr = res.getHeader("Date") || new Date(); //服务器时间取header
                    this.loading = false;
                    let list = (res.data || {}).data || [];
                    // 处理数据...
                    this.$unicom('list', list);
                }
            )
        },
        quickDate(action) {
            let date = new Date(this.formLabelAlign.date);
            if (date === '' || !date) {
                return;
            }
            if (action === 'before') {
                date = date.getTime() - 24*60*60*1000;
            }
            if (action === 'after') {
                date = date.getTime() + 24*60*60*1000;
            }
            this.formLabelAlign.date = new Date(date);
        }
    }
}
</script>

<style lang="less">
.search {
    margin-top: 20px;
    .form-box {
        display: flex;
        margin-top: 20px;
    }
    .inputs {
        display: flex;
        flex: 1;
        flex-wrap: wrap;
    }
    .btns {
        flex: 0 0 150px;
        line-height: 40px;
    }
    .btn {
        width: 100%;
    }
    .el-col {
        text-align: left;
    }
    .el-input {
        width: 110px;
    }
    .data-picker {
        width: 150px;
    }
    .align-left {
        text-align: left;
    }
    .align-right {
        text-align: right;
    }
}

</style>
