import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import classNames from 'classnames';
import type { AppDispatch } from '../../store/store';
import { ChevronRight } from 'lucide-react';
import {
  setSingleSelectState,
  setMultiSelectState,
  customErrorStyle,
  setInputState,
} from '../../lib';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Container,
  Field,
  FieldLabel,
  Form,
  Input,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Spinner,
  CardTitle,
  Progress,
  Badge,
  CardAction,
} from '../ui';
import {
  generateCostingRequest,
  selectCostingLoading,
} from '../../store/slices/costingSlice';
import {
  fetchMaterialCategories,
  fetchMaterialsByCategory,
  resetMaterials,
  selectMaterialLoading,
  selectMaterials,
  selectCategories,
} from '../../store/slices/materialSlice';
import {
  fetchFormulas,
  selectFormulas,
  selectFormula,
  selectFormulaLoading,
  resetFormulas,
  fetchFormulaById,
} from '../../store/slices/formulaSlice';
import type {
  ICostingRequest,
  IInputErrors,
  ISelect,
  IFormula,
  IMaterial,
  ILayers,
} from '../../global/interfaces';

const orderTypeOptions = [{ value: 'Conesleeves', label: 'Conesleeves' }];

// const categoryTypeOptions = [
//   { value: 1, label: "Adhesive" },
//   { value: 3, label: "Ink" },
//   { value: 6, label: "Substrate" },
// ];

const machineOptions = [
  { value: 1, label: 'Bobst CL750 D1350/450 Laminating Machine (without LPG)' },
  { value: 2, label: 'New Web Control Jumbo (Rewinding)' },
  { value: 3, label: 'Rotopak 888 1200/300C' },
  { value: 4, label: 'Automatic Punching' },
  { value: 5, label: 'Dayuan' },
];

export const mapToProcessRoute = (items: readonly ISelect[]) => {
  return items.map((item, index) => ({
    machineId: Number(item.value),
    stepOrder: index + 1,
  }));
};

interface ICategoryOption {
  value: number;
  label: string;
  category: string;
}

export const CostingOld = () => {
  const [categoryOptions, setCategoryOptions] = useState<ICategoryOption[]>([]);
  const [layerType, setLayerType] = useState<number>(0);
  const [netRollWidth, setNetRollWidth] = useState<number>(0);
  const [noOfColors, setNoOfColors] = useState<number>(0);
  const [noOfOuts, setNoOfOuts] = useState<number>(0);
  const [noOfUps, setNoOfUps] = useState<number>(0);
  const [openAddLayerSheet, setOpenAddLayerSheet] = useState<boolean>(false);
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [orderType, setOrderType] = useState<string>('');
  const [pcsPerBox, setPcsPerBox] = useState<number>(0);
  const [processRoute, setProcessRoute] = useState<readonly ISelect[]>([]);
  const [quantityOrder, setQuantityOrder] = useState<number>(0);
  const [repeatLength, setRepeatLength] = useState<number>(0);
  const [selectedFormula, setSelectedFormula] = useState<number>(0);
  const [selectedMaterial, setSelectedMaterial] = useState<number>(0);
  const [spreadHeight, setSpreadHeight] = useState<number>(0);
  const [spreadWidth, setSpreadWidth] = useState<number>(0);
  const [totalImages, setTotalImages] = useState<number>(0);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number | null>(
    null,
  );
  const [layerOptions, setLayerOptions] = useState<ILayers[]>([]);
  const [inkDetails, setInkDetails] = useState<IFormula | null>(null);
  const [materialDetails, setMaterialDetails] = useState<IMaterial | null>(
    null,
  );
  const [errors, setErrors] = useState<IInputErrors>({});

  const dispatch = useDispatch<AppDispatch>();

  const materialCategories = useSelector(selectCategories);
  const materialOptions = useSelector(selectMaterials);
  const formulaOptions = useSelector(selectFormulas);
  const selectedFormulaDetails = useSelector(selectFormula);

  const loading = useSelector(selectCostingLoading);
  const loadingMaterials = useSelector(selectMaterialLoading);
  const loadingFormulas = useSelector(selectFormulaLoading);

  useEffect(() => {
    dispatch(fetchMaterialCategories());
  }, [dispatch]);

  useEffect(() => {
    if (layerType > 0 && layerType !== 3) {
      dispatch(fetchMaterialsByCategory(layerType));
    }
    if (layerType > 0 && layerType == 3) {
      dispatch(fetchFormulas());
    }
  }, [layerType, dispatch]);

  useEffect(() => {
    if (materialCategories) {
      setCategoryOptions(materialCategories);
    }
  }, [materialCategories]);

  const selectFormulaChangeHandler = useCallback(
    (formula: any) => {
      const details = formulaOptions.find((f) => f.value === formula.value);
      setInkDetails(details ?? null);
      setTimeout(() => {
        if (details) {
          dispatch(fetchFormulaById(details.value));
        }
      }, 1);
    },
    [formulaOptions, selectedFormula],
  );

  const selectMaterialChangeHandler = useCallback(
    (material: any) => {
      const details = materialOptions.find(
        (m: IMaterial) => m.value === material.value,
      );
      if (details) {
        setMaterialDetails(details);
      }
    },
    [materialOptions, selectedMaterial],
  );

  const submitCostingHandler = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data: ICostingRequest = {
      orderType: orderType,
      quantityOrder: quantityOrder,
      spreadWidth: spreadWidth,
      spreadHeight: spreadHeight,
      noOfOuts: noOfOuts,
      noOfUps: noOfUps,
      totalImages: totalImages,
      netRollWidth: netRollWidth,
      repeatLength: repeatLength,
      pcsPerBox: pcsPerBox,
      noOfColor: noOfColors,
      processRoute: mapToProcessRoute(processRoute),
      layers: layerOptions,
      vehicle: 'L300',
    };
    console.log('[[Data]]', data);
    dispatch(generateCostingRequest(data));
  };

  const addLayerClickHandler = useCallback(() => {
    // Extract just the category string, fallback to empty string or default if not found
    const typeString =
      categoryOptions.find((c: ICategoryOption) => c.value === layerType)
        ?.category ?? '';

    const layerOrder = layerOptions.length;
    const isInk = layerType === 3;

    const name = isInk ? inkDetails?.label : materialDetails?.label;
    const formulaIdOrMaterialId = isInk ? selectedFormula : selectedMaterial;

    const baseLayer = {
      type: typeString, // Now correctly a string
      layerOrder,
      name,
    };

    const newLayer: ILayers = isInk
      ? ({
          ...baseLayer,
          formulaId: formulaIdOrMaterialId ?? 0,
          coveragePercent: inkDetails?.printCoverage,
          tnvc: inkDetails?.tnvc,
        } as ILayers)
      : ({
          ...baseLayer,
          materialId: formulaIdOrMaterialId ?? 0,
          coveragePercent: 100,
          tnvc: 100,
        } as ILayers);

    setLayerOptions((prevOptions) => [...prevOptions, newLayer]);
    setOpenAddLayerSheet(false);
    setSelectedLayerIndex(null);
  }, [
    layerType,
    categoryOptions, // Added
    layerOptions, // Added to prevent stale length logic
    inkDetails,
    materialDetails,
    selectedFormula,
    selectedMaterial,
    // materialOptions removed if unused inside the handler
  ]);

  const removeLayerClickHandler = useCallback((index: number) => {
    setLayerOptions((prev) => prev.filter((item) => item.layerOrder !== index));
    setSelectedLayerIndex(null);
  }, []);

  return (
    <>
      {selectedLayerIndex !== null && (
        <Sheet open={openSheet} onOpenChange={setOpenSheet}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {layerOptions[selectedLayerIndex].type} Details
              </SheetTitle>
            </SheetHeader>
            <Container>
              <div className='grid grid-cols-2'>
                <div className='flex flex-col'>
                  <span>Coverage (%)</span>
                  <b>{layerOptions[selectedLayerIndex].coveragePercent}%</b>
                </div>
                <div className='flex flex-col'>
                  <span>TNVC (%)</span>
                  <b>{layerOptions[selectedLayerIndex].tnvc}%</b>
                </div>
              </div>
              <div className='py-8'>
                <Button
                  onClick={() => removeLayerClickHandler(selectedLayerIndex)}
                >
                  Remove Item
                </Button>
              </div>
            </Container>
          </SheetContent>
        </Sheet>
      )}

      <Sheet open={openAddLayerSheet} onOpenChange={setOpenAddLayerSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New Layer</SheetTitle>
            <SheetDescription>
              {/* Type: {layerOptions[selectedLayerIndex].type} */}
            </SheetDescription>
          </SheetHeader>
          <Container>
            <div className='grid gap-6 mb-4 lg:grid-cols-0'>
              <div>
                <label
                  htmlFor='layerType'
                  className={classNames(
                    'block mb-2 text-sm font-medium',
                    errors.layerType ? 'text-red-600' : 'text-gray-900',
                  )}
                >
                  Type
                </label>
                <Select<ISelect>
                  id='layerType'
                  options={categoryOptions}
                  onChange={(type) => {
                    setSingleSelectState(
                      setLayerType,
                      setErrors,
                      'layerType',
                      type,
                    );
                  }}
                  styles={customErrorStyle('layerType', errors.layerType)}
                />
              </div>
            </div>
            {layerType !== 3 && layerType !== null && (
              <div className='grid gap-6 mb-4 lg:grid-cols-0'>
                <div>
                  <label
                    htmlFor='selectedMaterial'
                    className={classNames(
                      'block mb-2 text-sm font-medium',
                      errors.orderType ? 'text-red-600' : 'text-gray-900',
                    )}
                  >
                    Material
                  </label>
                  <Select<ISelect>
                    isLoading={loadingMaterials}
                    isDisabled={loadingMaterials}
                    id='selectedMaterial'
                    options={materialOptions}
                    onChange={(item) => {
                      selectMaterialChangeHandler(item);
                      setSingleSelectState(
                        setSelectedMaterial,
                        setErrors,
                        'selectedMaterial',
                        item,
                      );
                    }}
                    styles={customErrorStyle(
                      'selectedMaterial',
                      errors.selectedMaterial,
                    )}
                  />
                </div>
              </div>
            )}
            {layerType === 3 && layerType !== null && (
              <div className='grid gap-6 mb-4 lg:grid-cols-0'>
                <div>
                  <label
                    htmlFor='selectedFormula'
                    className={classNames(
                      'block mb-2 text-sm font-medium',
                      errors.orderType ? 'text-red-600' : 'text-gray-900',
                    )}
                  >
                    Formula
                  </label>
                  <Select<ISelect>
                    id='selectedFormula'
                    isLoading={loadingFormulas}
                    isDisabled={loadingFormulas}
                    options={formulaOptions}
                    onChange={(formula) => {
                      selectFormulaChangeHandler(formula);
                      setSingleSelectState(
                        setSelectedFormula,
                        setErrors,
                        'selectedFormula',
                        formula,
                      );
                    }}
                    styles={customErrorStyle(
                      'selectedFormula',
                      errors.selectedFormula,
                    )}
                  />
                </div>
              </div>
            )}
            {layerType === 3 && layerType !== null && inkDetails !== null && (
              <>
                <div className='grid grid-cols-2'>
                  <div className='flex flex-col'>
                    <span>Coverage (%)</span>
                    <b>{inkDetails?.printCoverage}%</b>
                  </div>
                  <div className='flex flex-col'>
                    <span>TNVC (%)</span>
                    <b>{inkDetails?.tnvc}%</b>
                  </div>
                </div>
                <hr />
                <div className='grid grid-cols-1 py-4'>
                  <div className='flex'>
                    <b>Components: </b>
                    <Badge className='ml-2' variant='default'>
                      {selectedFormulaDetails?.components.length}
                    </Badge>
                  </div>
                  <span className='text-xs'>
                    The formula contains the following components
                  </span>
                </div>
                <div className='max-h-64 overflow-y-auto'>
                  {selectedFormulaDetails &&
                    selectedFormulaDetails.components.map(
                      (detail: any, index: number) => (
                        <Card className='rounded-xs py-1.5' key={index}>
                          <CardContent className='grd grid-cols-2'>
                            <div className='flex'>{detail.material.name}</div>
                            <div className='flex font-bold'>
                              <span>Mixing Ratio:</span>
                              <p className='px-2'>{detail.mixingRatio}%</p>
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )}
                </div>
              </>
            )}
            <div className='py-4'>
              <Button
                type='button'
                className='py-4'
                onClick={() => addLayerClickHandler()}
              >
                Add To Layer
              </Button>
            </div>
          </Container>
        </SheetContent>
      </Sheet>
      <Container>
        <Card>
          <CardHeader>
            <CardTitle>Create Costing</CardTitle>
          </CardHeader>
          <CardContent>
            <Form onSubmit={submitCostingHandler}>
              <div className='grid gap-6 mb-4 lg:grid-cols-2'>
                <div>
                  <label
                    htmlFor='orderType'
                    className={classNames(
                      'block mb-2 text-sm font-medium',
                      errors.orderType ? 'text-red-600' : 'text-gray-900',
                    )}
                  >
                    Order Type
                  </label>
                  <Select<ISelect>
                    id='orderType'
                    options={orderTypeOptions}
                    onChange={(order) =>
                      setSingleSelectState(
                        setOrderType,
                        setErrors,
                        'orderType',
                        order,
                      )
                    }
                    styles={customErrorStyle('orderType', errors.orderType)}
                  />
                </div>
                <div className='flex-1'>
                  <Field data-invalid={errors && errors.quantityOrder}>
                    <FieldLabel htmlFor='quantityOrder'>Quantity</FieldLabel>
                    <Input
                      name='quantityOrder'
                      type='number'
                      onChange={(e) =>
                        setInputState(
                          e,
                          setQuantityOrder,
                          setErrors,
                          'quantityOrder',
                        )
                      }
                      value={quantityOrder}
                      aria-invalid={errors && errors.quantityOrder}
                    />
                  </Field>
                </div>
              </div>
              <div className='grid gap-6 mb-4 lg:grid-cols-2'>
                <div>
                  <Field data-invalid={errors && errors.spreadWidth}>
                    <FieldLabel htmlFor='spreadWidth'>Spread Width</FieldLabel>
                    <Input
                      name='spreadWidth'
                      type='number'
                      onChange={(e) =>
                        setInputState(
                          e,
                          setSpreadWidth,
                          setErrors,
                          'spreadWidth',
                        )
                      }
                      value={spreadWidth}
                      aria-invalid={errors && errors.spreadWidth}
                    />
                  </Field>
                </div>
                <div>
                  <Field data-invalid={errors && errors.spreadHeight}>
                    <FieldLabel htmlFor='spreadHeigth'>
                      Spread Height
                    </FieldLabel>
                    <Input
                      name='spreadHeight'
                      type='number'
                      onChange={(e) =>
                        setInputState(
                          e,
                          setSpreadHeight,
                          setErrors,
                          'spreadHeight',
                        )
                      }
                      value={spreadHeight}
                      aria-invalid={errors && errors.spreadHeight}
                    />
                  </Field>
                </div>
              </div>
              <div className='grid gap-6 mb-4 lg:grid-cols-2'>
                <div>
                  <Field data-invalid={errors && errors.noOfUps}>
                    <FieldLabel htmlFor='noOfUps'>Number Of Ups</FieldLabel>
                    <Input
                      name='noOfUps'
                      type='number'
                      onChange={(e) =>
                        setInputState(e, setNoOfUps, setErrors, 'noOfUps')
                      }
                      value={noOfUps}
                      aria-invalid={errors && errors.noOfUps}
                    />
                  </Field>
                </div>
                <div>
                  <Field data-invalid={errors && errors.noOfOuts}>
                    <FieldLabel htmlFor='noOfOuts'>Number Of Outs</FieldLabel>
                    <Input
                      name='noOfOuts'
                      type='number'
                      onChange={(e) =>
                        setInputState(e, setNoOfOuts, setErrors, 'noOfOuts')
                      }
                      value={noOfOuts}
                      aria-invalid={errors && errors.noOfOuts}
                    />
                  </Field>
                </div>
              </div>
              <div className='grid gap-6 mb-4 lg:grid-cols-2'>
                <div>
                  <Field data-invalid={errors && errors.totalImages}>
                    <FieldLabel htmlFor='totalImages'>Total Images</FieldLabel>
                    <Input
                      name='totalImages'
                      type='number'
                      onChange={(e) =>
                        setInputState(
                          e,
                          setTotalImages,
                          setErrors,
                          'totalImages',
                        )
                      }
                      value={totalImages}
                      aria-invalid={errors && errors.totalImages}
                    />
                  </Field>
                </div>
                <div>
                  <Field data-invalid={errors && errors.netRollWidth}>
                    <FieldLabel htmlFor='netRollWidth'>
                      Net Roll Width
                    </FieldLabel>
                    <Input
                      name='netRollWidth'
                      type='number'
                      onChange={(e) =>
                        setInputState(
                          e,
                          setNetRollWidth,
                          setErrors,
                          'netRollWidth',
                        )
                      }
                      value={netRollWidth}
                      aria-invalid={errors && errors.netRollWidth}
                    />
                  </Field>
                </div>
              </div>
              <div className='grid gap-6 mb-4 lg:grid-cols-3'>
                <div>
                  <Field data-invalid={errors && errors.repeatLength}>
                    <FieldLabel htmlFor='repeatLength'>
                      Repeat Length
                    </FieldLabel>
                    <Input
                      name='repeatLength'
                      type='number'
                      onChange={(e) =>
                        setInputState(
                          e,
                          setRepeatLength,
                          setErrors,
                          'repeatLength',
                        )
                      }
                      value={repeatLength}
                      aria-invalid={errors && errors.repeatLength}
                    />
                  </Field>
                </div>
                <div>
                  <Field data-invalid={errors && errors.pcsPerBox}>
                    <FieldLabel htmlFor='spreadHeigth'>
                      Pieces Per Box
                    </FieldLabel>
                    <Input
                      name='pcsPerBox'
                      type='number'
                      onChange={(e) =>
                        setInputState(e, setPcsPerBox, setErrors, 'pcsPerBox')
                      }
                      value={pcsPerBox}
                      aria-invalid={errors && errors.pcsPerBox}
                    />
                  </Field>
                </div>
                <div>
                  <Field data-invalid={errors && errors.noOfColors}>
                    <FieldLabel htmlFor='noOfColors'>
                      Number Of Colors
                    </FieldLabel>
                    <Input
                      name='noOfColors'
                      type='number'
                      onChange={(e) =>
                        setInputState(e, setNoOfColors, setErrors, 'noOfColors')
                      }
                      value={noOfColors}
                      aria-invalid={errors && errors.noOfColors}
                    />
                  </Field>
                </div>
              </div>
              <div className='grid gap-6 mb-4 lg:grid-cols-0'>
                <div>
                  <label
                    htmlFor='processRoute'
                    className={classNames(
                      'block mb-2 text-sm font-medium',
                      errors.processRoute ? 'text-red-600' : 'text-gray-900',
                    )}
                  >
                    Machines
                  </label>
                  <Select<ISelect, true>
                    id='processRoute'
                    isMulti
                    options={machineOptions}
                    value={processRoute}
                    onChange={(value) =>
                      setMultiSelectState(
                        setProcessRoute,
                        setErrors,
                        'processRoute',
                        value,
                      )
                    }
                    styles={customErrorStyle(
                      'processRoute',
                      errors.processRoute,
                    )}
                  />
                </div>
              </div>
              <div className='grid gap-0'>
                {layerOptions.map((layer, index) => {
                  return (
                    <Card className='rounded-sm' key={index}>
                      <CardContent className='p-2'>
                        <div className='grid gap-3 lg:grid-cols-[2fr_1fr_2fr_1fr_auto] items-center'>
                          <div className='lg:pl-8'>
                            {layer.type}
                            <br />
                            {layer.name}
                          </div>
                          <div>
                            <Badge>{layer.type}</Badge>
                          </div>
                          <div>
                            {layer.coveragePercent}%
                            <Progress value={layer.coveragePercent} />
                          </div>
                          <div>{layer.tnvc}%</div>
                          <div>
                            <ChevronRight
                              className='h-4 w-4'
                              onClick={() => {
                                setSelectedLayerIndex(index);
                                setOpenSheet(true);
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                <div className='py-4'>
                  <Button
                    type='button'
                    className='py-4'
                    onClick={() => {
                      // setSelectedLayerIndex(1);
                      setOpenAddLayerSheet(true);
                      // dispatch(resetMaterials());
                      // dispatch(resetFormulas());
                      setInkDetails(null);
                    }}
                  >
                    Add Layer
                  </Button>
                </div>
              </div>
              <div className='grid gap-6 mb-4 lg:grid-cols-0 py-4'>
                <div className='mr-0 ml-auto'>
                  <Button variant='default' disabled={loading}>
                    {loading && <Spinner data-icon='inline-start' />}
                    Generate Costing Request
                  </Button>
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};
