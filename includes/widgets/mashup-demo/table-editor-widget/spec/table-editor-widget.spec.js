/**
 * Copyright 2014 LaxarJS
 * Released under the MIT license.
 * www.laxarjs.org
 */
define( [
   '../table-editor-widget',
   'laxar/laxar_testing',
   'laxar-patterns',
   './spec_data'
], function( widgetModule, ax, patterns, specData ) {
   'use strict';

   describe( 'A TableEditorWidget', function() {

      var testBed_;

      beforeEach( function setup() {
         testBed_ = ax.testing.portalMocksAngular.createControllerTestBed( 'mashup-demo/table-editor-widget' );
         testBed_.featuresMock = {
            timeSeries: {
               resource: 'timeSeriesData'
            }
         };

         testBed_.useWidgetJson();
         testBed_.setup();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         testBed_.tearDown();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with feature timeSeries', function() {

         beforeEach( function() {

            testBed_.eventBusMock.publish( 'didReplace.timeSeriesData', {
               resource: 'timeSeriesData',
               data: specData.originalResource
            } );
            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'acts as a slave for the configured resource', function() {
            expect( testBed_.scope.eventBus.subscribe )
               .toHaveBeenCalledWith( 'didReplace.timeSeriesData', jasmine.any( Function ) );
            expect( testBed_.scope.eventBus.subscribe )
               .toHaveBeenCalledWith( 'didUpdate.timeSeriesData', jasmine.any( Function ) );
            expect( testBed_.scope.resources.timeSeries ).toEqual( specData.originalResource );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'shows the published resource as the data model of the table', function() {
            expect( testBed_.scope.model.tableModel ).toEqual( specData.expectedTableModel );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'publishes a didUpdate event after the user changed a data value', function() {
            testBed_.scope.model.tableModel[1][1] = 11;
            testBed_.scope.$emit( 'axTableEditor.afterChange' );

            var expectedResource = ax.object.deepClone( specData.originalResource );
            expectedResource.series[ 0 ].values[ 0 ] = 11;
            var patch = patterns.json.createPatch( specData.originalResource, expectedResource );

            expect( testBed_.scope.eventBus.publish )
               .toHaveBeenCalledWith( 'didUpdate.timeSeriesData', {
                  resource: 'timeSeriesData',
                  patches: patch
               }, jasmine.any( Object ) );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'ignores rows on which the time grid tick is removed in the didUpdate event data', function() {
            testBed_.scope.model.tableModel[2][0] = null;
            testBed_.scope.$emit( 'axTableEditor.afterChange' );

            var expectedResource = specData.expectedResourceWithRemovedTimeGridTick;
            var patch = patterns.json.createPatch( specData.originalResource, expectedResource );

            expect( testBed_.scope.eventBus.publish )
               .toHaveBeenCalledWith( 'didUpdate.timeSeriesData', {
                  resource: 'timeSeriesData',
                  patches: patch
               }, jasmine.any( Object ) );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'ignores columns on which the series label is removed in the didUpdate event data', function() {
            testBed_.scope.model.tableModel[0][2] = null;
            testBed_.scope.$emit( 'axTableEditor.afterChange' );

            var expectedResource = specData.expectedResourceWithRemovedSeriesLabel;
            var patch = patterns.json.createPatch( specData.originalResource, expectedResource );

            expect( testBed_.scope.eventBus.publish )
               .toHaveBeenCalledWith( 'didUpdate.timeSeriesData', {
                  resource: 'timeSeriesData',
                  patches: patch
               }, jasmine.any( Object ) );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'replaces the resource and model after receiving a new resource', function() {
            testBed_.eventBusMock.publish( 'didReplace.timeSeriesData', {
               resource: 'timeSeriesData',
               data: specData.otherResource
            } );
            jasmine.Clock.tick( 0 );
            expect( testBed_.scope.resources.timeSeries ).toEqual( specData.otherResource );
            expect( testBed_.scope.model.tableModel ).toEqual( specData.expectedTableModelForOtherResource );
         } );
      } );

   } );
} );